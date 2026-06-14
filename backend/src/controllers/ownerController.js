const pool = require("../config/db");

// [POST] /api/owner/profile
const submitProfile = async (req, res) => {
  const userId = req.user.userId;
  const {
    businessType,
    businessName,
    taxCode,
    businessAddress,
    repFullName,
    repPosition,
    repPhone,
    repEmail,
    repIdType,
    repIdNumber,
    repIdIssuedDate,
    repIdIssuedPlace,
  } = req.body;

  if (!repFullName || !repPhone || !repEmail || !repIdNumber) {
    return res
      .status(400)
      .json({
        error: "Vui lòng nhập đầy đủ thông tin người đại diện bắt buộc!",
      });
  }

  try {
    // Kiểm tra xem User này đã từng nộp hồ sơ chưa
    const checkProfile = await pool.query(
      `SELECT * FROM CourtOwnerProfile WHERE UserId = $1`,
      [userId],
    );

    if (checkProfile.rows.length > 0) {
      const currentStatus = checkProfile.rows[0].profilestatus; // Postgres trả về chữ thường
      if (currentStatus === "Approved") {
        return res
          .status(400)
          .json({ error: "Hồ sơ của bạn đã được duyệt, không thể nộp lại!" });
      }

      // Nếu đang Draft, Rejected hoặc Submitted thì cập nhật lại thông tin
      const updateQuery = `
        UPDATE CourtOwnerProfile 
        SET BusinessType = $1, BusinessName = $2, TaxCode = $3, BusinessAddress = $4,
            RepFullName = $5, RepPosition = $6, RepPhone = $7, RepEmail = $8,
            RepIdType = $9, RepIdNumber = $10, RepIdIssuedDate = $11, RepIdIssuedPlace = $12,
            ProfileStatus = 'Submitted', SubmittedAt = CURRENT_TIMESTAMP, UpdatedAt = CURRENT_TIMESTAMP
        WHERE UserId = $13 RETURNING *
      `;
      const updated = await pool.query(updateQuery, [
        businessType || "Individual",
        businessName,
        taxCode,
        businessAddress,
        repFullName,
        repPosition,
        repPhone,
        repEmail,
        repIdType || "CCCD",
        repIdNumber,
        repIdIssuedDate,
        repIdIssuedPlace,
        userId,
      ]);
      return res.json({
        message: "Cập nhật và nộp hồ sơ thành công!",
        profile: updated.rows[0],
      });
    }

    // Chưa từng nộp -> Thêm mới vào Database
    const insertQuery = `
      INSERT INTO CourtOwnerProfile 
      (UserId, BusinessType, BusinessName, TaxCode, BusinessAddress, RepFullName, RepPosition, RepPhone, RepEmail, RepIdType, RepIdNumber, RepIdIssuedDate, RepIdIssuedPlace, ProfileStatus, SubmittedAt)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Submitted', CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const inserted = await pool.query(insertQuery, [
      userId,
      businessType || "Individual",
      businessName,
      taxCode,
      businessAddress,
      repFullName,
      repPosition,
      repPhone,
      repEmail,
      repIdType || "CCCD",
      repIdNumber,
      repIdIssuedDate,
      repIdIssuedPlace,
    ]);

    res
      .status(201)
      .json({ message: "Nộp hồ sơ thành công!", profile: inserted.rows[0] });
  } catch (error) {
    console.error("Lỗi submitProfile:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi nộp hồ sơ.", details: error.message });
  }
};

// [GET] /api/owner/profile
const getProfile = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT * FROM CourtOwnerProfile WHERE UserId = $1`,
      [userId],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Bạn chưa nộp hồ sơ đăng ký chủ sân." });
    }
    res.json({
      message: "Lấy thông tin hồ sơ thành công!",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Lỗi getProfile:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi lấy hồ sơ.", details: error.message });
  }
};

module.exports = { submitProfile, getProfile };
