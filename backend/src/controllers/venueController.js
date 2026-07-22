const pool = require("../config/db");

// [POST] /api/venues - Tạo cơ sở mới
const createVenue = async (req, res) => {
  const userId = req.user.userId;
  const { venueName, address, district, city, openTime, closeTime, latitude, longitude } = req.body;

  if (!venueName || !address) {
    return res
      .status(400)
      .json({ error: "Vui lòng nhập tên và địa chỉ cơ sở!" });
  }

  try {
    // Tìm OwnerId từ UserId
    const ownerResult = await pool.query(
      "SELECT OwnerId FROM CourtOwnerProfile WHERE UserId = $1",
      [userId],
    );
    if (ownerResult.rows.length === 0) {
      return res.status(404).json({
        error: "Không tìm thấy hồ sơ chủ sân. Bạn cần nộp hồ sơ trước!",
      });
    }
    const ownerId = ownerResult.rows[0].ownerid;

    const insertQuery = `
      INSERT INTO Venue (OwnerId, VenueName, Address, District, City, OpenTime, CloseTime, Latitude, Longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `;
    const newVenue = await pool.query(insertQuery, [
      ownerId,
      venueName,
      address,
      district,
      city,
      openTime || "06:00",
      closeTime || "23:00",
      latitude || null,
      longitude || null,
    ]);

    res
      .status(201)
      .json({ message: "Tạo cơ sở thành công!", venue: newVenue.rows[0] });
  } catch (error) {
    console.error("Lỗi createVenue:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi tạo cơ sở.", details: error.message });
  }
};

// [GET] /api/venues - Lấy danh sách cơ sở của tôi
const getMyVenues = async (req, res) => {
  const userId = req.user.userId;
  try {
    const ownerResult = await pool.query(
      "SELECT OwnerId FROM CourtOwnerProfile WHERE UserId = $1",
      [userId],
    );
    if (ownerResult.rows.length === 0) {
      return res.json({ message: "Chưa có cơ sở nào", venues: [] });
    }
    const ownerId = ownerResult.rows[0].ownerid;

    const result = await pool.query("SELECT * FROM Venue WHERE OwnerId = $1", [
      ownerId,
    ]);
    res.json({ message: "Lấy danh sách thành công", venues: result.rows });
  } catch (error) {
    console.error("Lỗi getMyVenues:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi lấy cơ sở.", details: error.message });
  }
};

// [GET] /api/venues/all - Lấy danh sách toàn bộ cơ sở (Public API)
const getAllVenues = async (req, res) => {
  try {
    const query = `
      SELECT v.*, 
             COALESCE(ROUND(AVG(r.Rating)::numeric, 1), 5.0) as rating,
             (SELECT ImageUrl FROM VenueImage WHERE VenueId = v.VenueId ORDER BY IsMain DESC, UploadedAt DESC LIMIT 1) as mainimage
      FROM Venue v
      LEFT JOIN Review r ON v.VenueId = r.VenueId AND r.Status = 'Approved'
      WHERE v.Status = 'Active'
      GROUP BY v.VenueId
      ORDER BY v.CreatedAt DESC
    `;
    const result = await pool.query(query);
    res.json({
      message: "Lấy danh sách toàn bộ cơ sở thành công!",
      venues: result.rows,
    });
  } catch (error) {
    console.error("Lỗi getAllVenues:", error);
    res.status(500).json({
      error: "Lỗi server khi lấy danh sách cơ sở.",
      details: error.message,
    });
  }
};

// [GET] /api/venues/:venueId - Lấy chi tiết 1 cơ sở
const getVenueById = async (req, res) => {
  const { venueId } = req.params;
  try {
    const query = `
      SELECT v.*, 
             COALESCE(ROUND(AVG(r.Rating)::numeric, 1), 5.0) as rating,
             COUNT(r.ReviewId) as reviewscount
      FROM Venue v
      LEFT JOIN Review r ON v.VenueId = r.VenueId AND r.Status = 'Approved'
      WHERE v.VenueId = $1
      GROUP BY v.VenueId
    `;
    const result = await pool.query(query, [venueId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy cơ sở sân." });
    }
    res.json({
      message: "Lấy thông tin cơ sở thành công!",
      venue: result.rows[0],
    });
  } catch (error) {
    console.error("Lỗi getVenueById:", error);
    res.status(500).json({
      error: "Lỗi server khi lấy chi tiết cơ sở.",
      details: error.message,
    });
  }
};

// [POST] /api/venues/:venueId/images - Upload ảnh cho cơ sở
const uploadVenueImage = async (req, res) => {
  const { venueId } = req.params;
  if (!req.file) {
    return res.status(400).json({ error: "Không tìm thấy file tải lên!" });
  }

  // Đường dẫn tĩnh truy cập ảnh
  const imageUrl = `http://localhost:8080/uploads/${req.file.filename}`;

  const client = await pool.connect();
  try {
    // Ảnh vừa tải lên là banner mới của cơ sở.
    await client.query("BEGIN");
    await client.query("UPDATE VenueImage SET IsMain = FALSE WHERE VenueId = $1", [venueId]);
    const insertQuery = `INSERT INTO VenueImage (VenueId, ImageUrl, IsMain) VALUES ($1, $2, $3) RETURNING *`;
    const newImage = await client.query(insertQuery, [venueId, imageUrl, true]);
    await client.query("COMMIT");

    res
      .status(201)
      .json({ message: "Đã cập nhật banner cơ sở!", image: newImage.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi uploadVenueImage:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi lưu ảnh.", details: error.message });
  } finally {
    client.release();
  }
};

// [GET] /api/venues/:venueId/images - Lấy danh sách ảnh của cơ sở
const getVenueImages = async (req, res) => {
  const { venueId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM VenueImage WHERE VenueId = $1 ORDER BY IsMain DESC, UploadedAt DESC",
      [venueId],
    );
    res.json({ message: "Lấy danh sách ảnh thành công!", images: result.rows });
  } catch (error) {
    console.error("Lỗi getVenueImages:", error);
    res.status(500).json({
      error: "Lỗi server khi lấy danh sách ảnh.",
      details: error.message,
    });
  }
};

// [DELETE] /api/venues/images/:imageId - Xóa ảnh
const deleteVenueImage = async (req, res) => {
  const { imageId } = req.params;
  try {
    await pool.query("DELETE FROM VenueImage WHERE ImageId = $1", [imageId]);
    res.json({ message: "Đã xóa ảnh thành công!" });
  } catch (error) {
    console.error("Lỗi deleteVenueImage:", error);
    res.status(500).json({ error: "Lỗi xóa ảnh." });
  }
};

// [PUT] /api/venues/:venueId - Cập nhật cơ sở
const updateVenue = async (req, res) => {
  const userId = req.user.userId;
  const { venueId } = req.params;
  const { venueName, address, district, city, openTime, closeTime, latitude, longitude } = req.body;

  try {
    const ownerResult = await pool.query(
      "SELECT OwnerId FROM CourtOwnerProfile WHERE UserId = $1",
      [userId]
    );
    if (ownerResult.rows.length === 0) return res.status(404).json({ error: "Không tìm thấy hồ sơ chủ sân." });
    const ownerId = ownerResult.rows[0].ownerid;

    const checkVenue = await pool.query("SELECT * FROM Venue WHERE VenueId = $1 AND OwnerId = $2", [venueId, ownerId]);
    if (checkVenue.rows.length === 0) return res.status(404).json({ error: "Không tìm thấy cơ sở hoặc bạn không có quyền." });

    const updateQuery = `
      UPDATE Venue 
      SET VenueName = $1, Address = $2, District = $3, City = $4, OpenTime = $5, CloseTime = $6, Latitude = $7, Longitude = $8, UpdatedAt = CURRENT_TIMESTAMP
      WHERE VenueId = $9 RETURNING *
    `;
    const updated = await pool.query(updateQuery, [venueName, address, district, city, openTime, closeTime, latitude || null, longitude || null, venueId]);

    res.json({ message: "Cập nhật cơ sở thành công!", venue: updated.rows[0] });
  } catch (error) {
    console.error("Lỗi updateVenue:", error);
    res.status(500).json({ error: "Lỗi server khi cập nhật cơ sở.", details: error.message });
  }
};

// [DELETE] /api/venues/:venueId - Xóa mềm cơ sở
const deleteVenue = async (req, res) => {
  const userId = req.user.userId;
  const { venueId } = req.params;

  try {
    const ownerResult = await pool.query("SELECT OwnerId FROM CourtOwnerProfile WHERE UserId = $1", [userId]);
    if (ownerResult.rows.length === 0) return res.status(404).json({ error: "Không tìm thấy hồ sơ chủ sân." });
    const ownerId = ownerResult.rows[0].ownerid;

    const checkVenue = await pool.query("SELECT * FROM Venue WHERE VenueId = $1 AND OwnerId = $2", [venueId, ownerId]);
    if (checkVenue.rows.length === 0) return res.status(404).json({ error: "Không tìm thấy cơ sở hoặc bạn không có quyền." });

    await pool.query("UPDATE Venue SET Status = 'Inactive' WHERE VenueId = $1", [venueId]);
    // Also soft delete all courts in this venue
    await pool.query("UPDATE Court SET Status = 'Inactive' WHERE VenueId = $1", [venueId]);

    res.json({ message: "Đã xóa (Ngừng hoạt động) cơ sở thành công!" });
  } catch (error) {
    console.error("Lỗi deleteVenue:", error);
    res.status(500).json({ error: "Lỗi server khi xóa cơ sở.", details: error.message });
  }
};

module.exports = {
  createVenue,
  getMyVenues,
  getAllVenues,
  getVenueById,
  uploadVenueImage,
  getVenueImages,
  deleteVenueImage,
  updateVenue,
  deleteVenue,
};
