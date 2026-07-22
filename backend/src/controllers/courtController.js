const pool = require("../config/db");

const createDefaultPricingForCourt = async (courtId) => {
  await pool.query(
    `INSERT INTO TimeSlotPricing (CourtId, SlotName, StartTime, EndTime, Price, DayType, IsActive)
     SELECT $1, slot_name, start_time::time, end_time::time, price, 'All', TRUE
     FROM (VALUES
       ('Giờ thấp điểm', '05:00:00', '17:00:00', 80000.00),
       ('Giờ cao điểm', '17:00:00', '22:00:00', 120000.00)
     ) AS defaults(slot_name, start_time, end_time, price)
     WHERE NOT EXISTS (
       SELECT 1 FROM TimeSlotPricing WHERE CourtId = $1
     )`,
    [courtId],
  );
};

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
    await createDefaultPricingForCourt(newCourt.rows[0].courtid);

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

// [GET] /api/courts/suggestions?q=...
// Dùng cho các ô tìm sân có gợi ý, trả về cả tên cơ sở để phân biệt sân trùng tên.
const getCourtSuggestions = async (req, res) => {
  const query = String(req.query.q || "").trim();
  try {
    const result = await pool.query(
      `SELECT c.CourtId, c.CourtName, c.VenueId, v.VenueName, v.Address
       FROM Court c
       JOIN Venue v ON v.VenueId = c.VenueId
       WHERE c.CourtName ILIKE $1 OR v.VenueName ILIKE $1
       ORDER BY v.VenueName, c.CourtName
       LIMIT 20`,
      [`%${query}%`],
    );
    res.json({ courts: result.rows });
  } catch (error) {
    console.error("Lỗi lấy gợi ý sân:", error);
    res.status(500).json({ error: "Không thể lấy gợi ý sân." });
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

// [PUT] /api/courts/:courtId - Cập nhật sân
const updateCourt = async (req, res) => {
  const { courtId } = req.params;
  const { courtName, courtCode, surfaceType, isIndoor } = req.body;
  const userId = req.user.userId;

  try {
    const ownerCheck = await pool.query(
      `SELECT v.VenueId FROM Venue v 
       JOIN Court c ON c.VenueId = v.VenueId 
       JOIN CourtOwnerProfile cop ON v.OwnerId = cop.OwnerId 
       WHERE c.CourtId = $1 AND cop.UserId = $2`,
      [courtId, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: "Bạn không có quyền cập nhật sân này!" });
    }

    const updateQuery = `
      UPDATE Court 
      SET CourtName = $1, CourtCode = $2, SurfaceType = $3, IsIndoor = $4
      WHERE CourtId = $5 RETURNING *
    `;
    const indoorVal = isIndoor === undefined ? true : isIndoor;
    const updated = await pool.query(updateQuery, [courtName, courtCode, surfaceType || "PVC 4.5mm", indoorVal, courtId]);

    res.json({ message: "Cập nhật sân thành công!", court: updated.rows[0] });
  } catch (error) {
    console.error("Lỗi updateCourt:", error);
    res.status(500).json({ error: "Lỗi server khi cập nhật sân.", details: error.message });
  }
};

// [DELETE] /api/courts/:courtId - Xóa mềm sân
const deleteCourt = async (req, res) => {
  const { courtId } = req.params;
  const userId = req.user.userId;

  try {
    const ownerCheck = await pool.query(
      `SELECT v.VenueId FROM Venue v 
       JOIN Court c ON c.VenueId = v.VenueId 
       JOIN CourtOwnerProfile cop ON v.OwnerId = cop.OwnerId 
       WHERE c.CourtId = $1 AND cop.UserId = $2`,
      [courtId, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: "Bạn không có quyền xóa sân này!" });
    }

    await pool.query("UPDATE Court SET Status = 'Inactive' WHERE CourtId = $1", [courtId]);

    res.json({ message: "Đã xóa (Ngừng hoạt động) sân thành công!" });
  } catch (error) {
    console.error("Lỗi deleteCourt:", error);
    res.status(500).json({ error: "Lỗi server khi xóa sân.", details: error.message });
  }
};

module.exports = { createCourt, getCourtsByVenue, getCourtSuggestions, getCourtById, updateCourt, deleteCourt };
