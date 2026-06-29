const pool = require("../config/db");

const isOwnerOfVenue = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Chưa xác thực người dùng!" });
  }

  const roleId = Number(req.user.roleId);
  const userId = req.user.userId;
  const venueId = Number(req.params.venueId);

  if (isNaN(venueId)) {
    return res.status(400).json({ error: "venueId không hợp lệ!" });
  }

  if (roleId === 1) {
    return next();
  }

  try {
    const ownerResult = await pool.query(
      "SELECT OwnerId FROM CourtOwnerProfile WHERE UserId = $1",
      [userId],
    );

    if (ownerResult.rows.length === 0) {
      return res.status(403).json({ error: "Bạn không có hồ sơ chủ sân!" });
    }

    const ownerId = ownerResult.rows[0].ownerid;

    const venueResult = await pool.query(
      "SELECT ManagerId FROM Venue WHERE VenueId = $1 AND OwnerId = $2",
      [venueId, ownerId],
    );

    if (venueResult.rows.length === 0) {
      const managerResult = await pool.query(
        "SELECT VenueId FROM Venue WHERE VenueId = $1 AND ManagerId = $2",
        [venueId, userId],
      );
      if (managerResult.rows.length === 0) {
        return res.status(403).json({ error: "Bạn không có quyền quản lý cơ sở này!" });
      }
    }

    next();
  } catch (error) {
    console.error("Lỗi isOwnerOfVenue:", error);
    return res.status(500).json({ error: "Lỗi server khi kiểm tra quyền sở hữu." });
  }
};

module.exports = {
  isOwnerOfVenue,
};
