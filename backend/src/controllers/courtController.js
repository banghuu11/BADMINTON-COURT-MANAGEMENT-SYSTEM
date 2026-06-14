const pool = require("../config/db");

// [POST] /api/courts - Thêm sân vào cơ sở
const createCourt = async (req, res) => {
  const { venueId, courtName, courtCode, surfaceType, isIndoor } = req.body;

  if (!venueId || !courtName) {
    return res.status(400).json({ error: "Vui lòng nhập VenueId và Tên sân!" });
  }

  try {
    const insertQuery = `
      INSERT INTO Court (VenueId, CourtName, CourtCode, SurfaceType, IsIndoor)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    // Nếu isIndoor ko truyền thì mặc định là true
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

module.exports = { createCourt, getCourtsByVenue };
