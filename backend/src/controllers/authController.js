const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "CourtSync_Secret_Key_2024";
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || "CourtSync_Refresh_Secret_2024";

// [POST] /api/auth/register
const register = async (req, res) => {
  const { username, password, fullName, phoneNumber, email } = req.body;

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

    // 2. Lấy RoleId của 'Customer' (Khách hàng)
    const roleCheck = await pool.query(
      `SELECT RoleId FROM Role WHERE RoleName = $1`,
      ["Customer"],
    );

    let roleId = 5;
    if (roleCheck.rows.length > 0) {
      roleId = roleCheck.rows[0].roleid;
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
      `SELECT UserId, Username, FullName, PhoneNumber, Email, RoleId, AvatarUrl, IsActive, SkillLevel
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

module.exports = {
  register,
  login,
  getProfile,
  refreshToken,
};
