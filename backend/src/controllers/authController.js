const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "CourtSync_Secret_Key_2024";
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || "CourtSync_Refresh_Secret_2024";

// [POST] /api/auth/register
const register = async (req, res) => {
  const { username, password, fullName, phoneNumber, email, roleName } = req.body;

  // Kiểm tra dữ liệu đầu vào cơ bản
  if (!username || !password || !fullName || !phoneNumber) {
    return res
      .status(400)
      .json({ error: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
  }

  try {
    // 1. Kiểm tra username hoặc phoneNumber đã tồn tại chưa
    const userCheck = await pool.query(
      `SELECT * FROM AppUser WHERE Username = $1 OR PhoneNumber = $2`,
      [username, phoneNumber],
    );

    if (userCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Tên đăng nhập hoặc Số điện thoại đã tồn tại!" });
    }

    // 2. Lấy RoleId theo roleName (nếu truyền vào) hoặc mặc định là 'Customer'
    const targetRole = roleName || "Customer";
    const roleCheck = await pool.query(
      `SELECT RoleId FROM Role WHERE RoleName = $1`,
      [targetRole],
    );

    let roleId = 5;
    if (roleCheck.rows.length > 0) {
      roleId = roleCheck.rows[0].roleid;
    } else {
      // Fallback nếu không tìm thấy roleName truyền vào
      const defaultRoleCheck = await pool.query(
        `SELECT RoleId FROM Role WHERE RoleName = $1`,
        ["Customer"],
      );
      if (defaultRoleCheck.rows.length > 0) {
        roleId = defaultRoleCheck.rows[0].roleid;
      }
    }

    // 3. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Lưu vào Database
    const newUser = await pool.query(
      `INSERT INTO AppUser (RoleId, Username, PasswordHash, FullName, PhoneNumber, Email) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING UserId, Username, FullName, RoleId`,
      [roleId, username, passwordHash, fullName, phoneNumber, email || null],
    );

    res.status(201).json({
      message: "Đăng ký tài khoản thành công!",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Lỗi Register:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi đăng ký.", details: error.message });
  }
};

// [POST] /api/auth/login
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Vui lòng nhập tài khoản và mật khẩu!" });
  }

  try {
    const userResult = await pool.query(
      `SELECT * FROM AppUser WHERE Username = $1`,
      [username],
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Tài khoản không tồn tại!" });
    }

    const user = userResult.rows[0];
    const dbPasswordHash = user.passwordhash;

    const isMatch = await bcrypt.compare(password, dbPasswordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Sai mật khẩu!" });
    }

    const payload = {
      userId: user.userid,
      roleId: user.roleid,
    };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" }); // Sống 15 phút
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" }); // Sống 7 ngày

    res.json({
      message: "Đăng nhập thành công!",
      accessToken,
      refreshToken,
      user: payload,
    });
  } catch (error) {
    console.error("Lỗi Login:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi đăng nhập.", details: error.message });
  }
};

// [GET] /api/auth/profile
const getProfile = async (req, res) => {
  try {
    // Lấy userId từ Token do middleware authenticateToken truyền vào
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT UserId, Username, FullName, PhoneNumber, Email, RoleId, AvatarUrl, IsActive, SkillLevel, DateOfBirth, Gender, Address
       FROM AppUser WHERE UserId = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng!" });
    }

    res.json({ message: "Lấy thông tin thành công!", user: result.rows[0] });
  } catch (error) {
    console.error("Lỗi getProfile:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi lấy thông tin.", details: error.message });
  }
};

// [PUT] /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phoneNumber, email, address, dateOfBirth, gender, skillLevel } = req.body;

    // 1. Kiểm tra thông tin bắt buộc
    if (!fullName || !phoneNumber) {
      return res.status(400).json({ error: "Họ tên và Số điện thoại là bắt buộc!" });
    }

    // 2. Kiểm tra trùng số điện thoại
    const phoneCheck = await pool.query(
      `SELECT UserId FROM AppUser WHERE PhoneNumber = $1 AND UserId <> $2`,
      [phoneNumber, userId]
    );
    if (phoneCheck.rows.length > 0) {
      return res.status(400).json({ error: "Số điện thoại đã được sử dụng bởi tài khoản khác!" });
    }

    // 3. Kiểm tra trùng email
    if (email) {
      const emailCheck = await pool.query(
        `SELECT UserId FROM AppUser WHERE Email = $1 AND UserId <> $2`,
        [email, userId]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: "Email đã được sử dụng bởi tài khoản khác!" });
      }
    }

    // 4. Nếu có file upload, tạo đường dẫn ảnh đại diện mới
    let avatarUrl = null;
    if (req.file) {
      avatarUrl = `http://localhost:8080/uploads/${req.file.filename}`;
    }

    let updateQuery;
    let queryParams;

    if (avatarUrl) {
      updateQuery = `
        UPDATE AppUser 
        SET FullName = $1, PhoneNumber = $2, Email = $3, Address = $4, DateOfBirth = $5, Gender = $6, SkillLevel = $7, AvatarUrl = $8, UpdatedAt = CURRENT_TIMESTAMP
        WHERE UserId = $9
        RETURNING UserId, Username, FullName, PhoneNumber, Email, RoleId, AvatarUrl, IsActive, SkillLevel, DateOfBirth, Gender, Address
      `;
      queryParams = [
        fullName,
        phoneNumber,
        email || null,
        address || null,
        dateOfBirth || null,
        gender || null,
        skillLevel || 'Trung bình',
        avatarUrl,
        userId
      ];
    } else {
      updateQuery = `
        UPDATE AppUser 
        SET FullName = $1, PhoneNumber = $2, Email = $3, Address = $4, DateOfBirth = $5, Gender = $6, SkillLevel = $7, UpdatedAt = CURRENT_TIMESTAMP
        WHERE UserId = $8
        RETURNING UserId, Username, FullName, PhoneNumber, Email, RoleId, AvatarUrl, IsActive, SkillLevel, DateOfBirth, Gender, Address
      `;
      queryParams = [
        fullName,
        phoneNumber,
        email || null,
        address || null,
        dateOfBirth || null,
        gender || null,
        skillLevel || 'Trung bình',
        userId
      ];
    }

    const updatedUser = await pool.query(updateQuery, queryParams);

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng!" });
    }

    res.json({
      message: "Cập nhật hồ sơ thành công!",
      user: updatedUser.rows[0]
    });
  } catch (error) {
    console.error("Lỗi updateProfile:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi cập nhật hồ sơ.", details: error.message });
  }
};

// [POST] /api/auth/refresh - Cấp lại Token mới
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: "Thiếu Refresh Token!" });
  }
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const payload = { userId: decoded.userId, roleId: decoded.roleId };

    // Cấp lại cặp token mới (Refresh Token Rotation)
    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
    const newRefreshToken = jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: "7d",
    });
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res
      .status(403)
      .json({ error: "Refresh Token không hợp lệ hoặc đã hết hạn!" });
  }
};

// [POST] /api/auth/forgot-password - Yêu cầu cấp lại mật khẩu (Mock gửi OTP)
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Vui lòng nhập Email!" });
  }

  try {
    const userCheck = await pool.query(
      `SELECT UserId, FullName FROM AppUser WHERE Email = $1`,
      [email]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản với Email này!" });
    }

    // Tạo mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // Hết hạn sau 15 phút

    await pool.query(
      `UPDATE AppUser SET ResetToken = $1, ResetTokenExpiry = $2 WHERE Email = $3`,
      [otp, expiry, email]
    );

    // MÔ PHỎNG GỬI EMAIL BẰNG CÁCH IN RA CONSOLE
    console.log("=====================================");
    console.log(`[MOCK EMAIL] Gửi đến: ${email}`);
    console.log(`Xin chào ${userCheck.rows[0].fullname},`);
    console.log(`Mã OTP để đặt lại mật khẩu của bạn là: ${otp}`);
    console.log(`Mã này sẽ hết hạn sau 15 phút.`);
    console.log("=====================================");

    res.json({ message: "Mã OTP đã được gửi đến Email của bạn!" });
  } catch (error) {
    console.error("Lỗi forgotPassword:", error);
    res.status(500).json({ error: "Lỗi server.", details: error.message });
  }
};

// [POST] /api/auth/reset-password - Đặt lại mật khẩu với OTP
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ Email, OTP và Mật khẩu mới!" });
  }

  try {
    const userCheck = await pool.query(
      `SELECT UserId, ResetToken, ResetTokenExpiry FROM AppUser WHERE Email = $1`,
      [email]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Tài khoản không tồn tại!" });
    }

    const user = userCheck.rows[0];

    // Kiểm tra OTP và thời hạn
    if (!user.resettoken || user.resettoken !== otp) {
      return res.status(400).json({ error: "Mã OTP không chính xác!" });
    }

    if (new Date() > new Date(user.resettokenexpiry)) {
      return res.status(400).json({ error: "Mã OTP đã hết hạn!" });
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Cập nhật pass và xóa OTP
    await pool.query(
      `UPDATE AppUser SET PasswordHash = $1, ResetToken = NULL, ResetTokenExpiry = NULL WHERE Email = $2`,
      [passwordHash, email]
    );

    res.json({ message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại." });
  } catch (error) {
    console.error("Lỗi resetPassword:", error);
    res.status(500).json({ error: "Lỗi server.", details: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  refreshToken,
  forgotPassword,
  resetPassword,
};

