const pool = require("../config/db");

// [POST] /api/courts - Thêm sân vào cơ sở
const createCourt = async (req, res) => {
  const { venueId, courtName, courtCode, surfaceType, isIndoor } = req.body;

  if (!venueId || !courtName) {
    return res.status(400).json({ error: "Vui lòng nhập VenueId và Tên sân!" });
  }

  try {
    const userId = req.user.userId;
    const roleId = Number(req.user.roleId);

    if (roleId === 3) {
      const checkOwner = await pool.query(
        "SELECT VenueId FROM Venue WHERE VenueId = $1 AND ManagerId = $2",
        [venueId, userId],
      );
      if (checkOwner.rows.length === 0) {
        const ownerCheck = await pool.query(
          "SELECT v.VenueId FROM Venue v JOIN CourtOwnerProfile cop ON v.OwnerId = cop.OwnerId WHERE v.VenueId = $1 AND cop.UserId = $2",
          [venueId, userId],
        );
        if (ownerCheck.rows.length === 0) {
          return res.status(403).json({ error: "Bạn không có quyền thêm sân vào cơ sở này!" });
        }
      }
    }

    const insertQuery = `
      INSERT INTO Court (VenueId, CourtName, CourtCode, SurfaceType, IsIndoor)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const indoorVal = isIndoor === undefined ? true : isIndoor;
    const newCourt = await pool.query(insertQuery, [
      venueId,
      courtName,
      courtCode,
      surfaceType || "PVC 4.5mm",
      indoorVal,
    ]);

    res
      .status(201)
      .json({ message: "Tạo sân thành công!", court: newCourt.rows[0] });
  } catch (error) {
    console.error("Lỗi createCourt:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi tạo sân.", details: error.message });
  }
};

// [GET] /api/courts/venue/:venueId - Lấy danh sách sân theo cơ sở
const getCourtsByVenue = async (req, res) => {
  const { venueId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM Court WHERE VenueId = $1", [
      venueId,
    ]);
    res.json({ message: "Lấy danh sách sân thành công!", courts: result.rows });
  } catch (error) {
    console.error("Lỗi getCourtsByVenue:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi lấy sân.", details: error.message });
  }
};

// [GET] /api/courts/:id - Lấy chi tiết sân theo ID
const getCourtById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT c.*, v.VenueName, v.Address FROM Court c JOIN Venue v ON c.VenueId = v.VenueId WHERE c.CourtId = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy sân đấu này!" });
    }
    res.json({ message: "Lấy chi tiết sân thành công!", court: result.rows[0] });
  } catch (error) {
    console.error("Lỗi getCourtById:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi lấy chi tiết sân.", details: error.message });
  }
};

module.exports = { createCourt, getCourtsByVenue, getCourtById };


