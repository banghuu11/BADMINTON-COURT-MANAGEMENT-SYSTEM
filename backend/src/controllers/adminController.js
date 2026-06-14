const pool = require("../config/db");

// [GET] /api/admin/owners/pending - Lấy danh sách hồ sơ chờ duyệt
const getPendingOwners = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cop.*, u.Username, u.Email, u.FullName 
       FROM CourtOwnerProfile cop 
       JOIN AppUser u ON cop.UserId = u.UserId 
       WHERE cop.ProfileStatus = 'Submitted'`,
    );
    res.json({ message: "Lấy danh sách thành công!", owners: result.rows });
  } catch (error) {
    console.error("Lỗi getPendingOwners:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi lấy danh sách.", details: error.message });
  }
};

// [POST] /api/admin/owners/review - Duyệt/Từ chối hồ sơ
const reviewOwnerProfile = async (req, res) => {
  const adminId = req.user.userId;
  const { ownerId, decision, note } = req.body; // decision: 'Approve' | 'Reject' | 'Suspend'

  try {
    await pool.query("CALL sp_ReviewOwnerProfile($1, $2, $3, $4)", [
      ownerId,
      adminId,
      decision,
      note,
    ]);
    res.json({ message: `Hồ sơ đã được xử lý (${decision}) thành công!` });
  } catch (error) {
    console.error("Lỗi reviewOwnerProfile:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi duyệt hồ sơ.", details: error.message });
  }
};

module.exports = { getPendingOwners, reviewOwnerProfile };
