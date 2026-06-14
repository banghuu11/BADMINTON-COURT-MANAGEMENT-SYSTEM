const pool = require("../config/db");

// [GET] /api/services/venue/:venueId - Lấy danh sách dịch vụ của cơ sở
const getServicesByVenue = async (req, res) => {
  const { venueId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM ServiceItem WHERE VenueId = $1 AND IsActive = TRUE ORDER BY ServiceName ASC",
      [venueId],
    );
    res.json({
      message: "Lấy danh sách dịch vụ thành công!",
      services: result.rows,
    });
  } catch (error) {
    console.error("Lỗi getServicesByVenue:", error);
    res.status(500).json({
      error: "Lỗi server khi lấy danh sách dịch vụ.",
      details: error.message,
    });
  }
};

// [POST] /api/services - Thêm sản phẩm/dịch vụ mới
const createService = async (req, res) => {
  const userId = req.user.userId;
  const {
    venueId,
    categoryId,
    serviceName,
    sku,
    unitPrice,
    costPrice,
    unit,
    stockQuantity,
    minStockAlert,
    imageUrl,
    isRentable,
    rentalPrice,
  } = req.body;

  if (!venueId || !serviceName || !unitPrice) {
    return res
      .status(400)
      .json({ error: "Vui lòng nhập VenueId, Tên dịch vụ và Đơn giá bán!" });
  }

  try {
    // (Tùy chọn) Kiểm tra xem user có phải chủ của Venue này không
    const checkOwner = await pool.query(
      "SELECT v.VenueId FROM Venue v JOIN CourtOwnerProfile cop ON v.OwnerId = cop.OwnerId WHERE v.VenueId = $1 AND cop.UserId = $2",
      [venueId, userId],
    );

    if (checkOwner.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền thêm sản phẩm vào cơ sở này!" });
    }

    const insertQuery = `
      INSERT INTO ServiceItem (VenueId, CategoryId, ServiceName, SKU, UnitPrice, CostPrice, Unit, StockQuantity, MinStockAlert, ImageUrl, IsRentable, RentalPrice)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *
    `;
    const values = [
      venueId,
      categoryId || null,
      serviceName,
      sku || null,
      unitPrice,
      costPrice || null,
      unit || "Cái",
      stockQuantity || 0,
      minStockAlert || 5,
      imageUrl || null,
      isRentable || false,
      rentalPrice || null,
    ];

    const newService = await pool.query(insertQuery, values);
    res.status(201).json({
      message: "Thêm sản phẩm thành công!",
      service: newService.rows[0],
    });
  } catch (error) {
    console.error("Lỗi createService:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi thêm sản phẩm.", details: error.message });
  }
};

// [PUT] /api/services/:serviceId - Sửa thông tin sản phẩm
const updateService = async (req, res) => {
  const { serviceId } = req.params;
  const { serviceName, unitPrice, costPrice, stockQuantity, isActive } =
    req.body;

  try {
    const updateQuery = `
      UPDATE ServiceItem 
      SET ServiceName = COALESCE($1, ServiceName), 
          UnitPrice = COALESCE($2, UnitPrice), 
          CostPrice = COALESCE($3, CostPrice), 
          StockQuantity = COALESCE($4, StockQuantity), 
          IsActive = COALESCE($5, IsActive)
      WHERE ServiceId = $6 RETURNING *
    `;
    const updated = await pool.query(updateQuery, [
      serviceName,
      unitPrice,
      costPrice,
      stockQuantity,
      isActive,
      serviceId,
    ]);
    if (updated.rows.length === 0)
      return res.status(404).json({ error: "Không tìm thấy sản phẩm." });

    res.json({
      message: "Cập nhật sản phẩm thành công!",
      service: updated.rows[0],
    });
  } catch (error) {
    console.error("Lỗi updateService:", error);
    res
      .status(500)
      .json({
        error: "Lỗi server khi cập nhật sản phẩm.",
        details: error.message,
      });
  }
};

// [DELETE] /api/services/:serviceId - Vô hiệu hóa sản phẩm (Xóa mềm)
const deleteService = async (req, res) => {
  const { serviceId } = req.params;
  try {
    // Thực hiện Xóa mềm (Soft Delete) bằng cách set IsActive = FALSE thay vì DROP rủi ro
    const deleted = await pool.query(
      "UPDATE ServiceItem SET IsActive = FALSE WHERE ServiceId = $1 RETURNING *",
      [serviceId],
    );
    if (deleted.rows.length === 0)
      return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
    res.json({ message: "Đã vô hiệu hóa sản phẩm thành công!" });
  } catch (error) {
    console.error("Lỗi deleteService:", error);
    res
      .status(500)
      .json({
        error: "Lỗi server khi vô hiệu hóa sản phẩm.",
        details: error.message,
      });
  }
};

module.exports = {
  getServicesByVenue,
  createService,
  updateService,
  deleteService,
};
