const pool = require("../config/db");

// [GET] /api/promotions/venue/:venueId - Lấy danh sách khuyến mãi của cơ sở
const getPromotionsByVenue = async (req, res) => {
  const { venueId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM Promotion WHERE VenueId = $1 AND IsActive = TRUE ORDER BY StartDate DESC",
      [venueId],
    );
    res.json({
      message: "Lấy danh sách khuyến mãi thành công!",
      promotions: result.rows,
    });
  } catch (error) {
    console.error("Lỗi getPromotions:", error);
    res.status(500).json({ error: "Lỗi server.", details: error.message });
  }
};

// [POST] /api/promotions - Tạo khuyến mãi mới
const createPromotion = async (req, res) => {
  const {
    venueId,
    promotionName,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    startDate,
    endDate,
    usageLimit,
  } = req.body;

  if (
    !venueId ||
    !promotionName ||
    !discountType ||
    !discountValue ||
    !startDate ||
    !endDate
  ) {
    return res
      .status(400)
      .json({ error: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
  }

  try {
    const insertQuery = `
      INSERT INTO Promotion (VenueId, PromotionName, Description, DiscountType, DiscountValue, MinOrderAmount, MaxDiscount, StartDate, EndDate, UsageLimit)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
    `;
    const values = [
      venueId,
      promotionName,
      description,
      discountType,
      discountValue,
      minOrderAmount || 0,
      maxDiscount || null,
      startDate,
      endDate,
      usageLimit || null,
    ];

    const newPromo = await pool.query(insertQuery, values);
    res
      .status(201)
      .json({
        message: "Tạo khuyến mãi thành công!",
        promotion: newPromo.rows[0],
      });
  } catch (error) {
    console.error("Lỗi createPromotion:", error);
    res
      .status(500)
      .json({ error: "Lỗi tạo khuyến mãi.", details: error.message });
  }
};

// [PUT] /api/promotions/:id - Cập nhật khuyến mãi
const updatePromotion = async (req, res) => {
  const { id } = req.params;
  const {
    promotionName,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    startDate,
    endDate,
    usageLimit,
  } = req.body;

  try {
    const updateQuery = `
      UPDATE Promotion 
      SET PromotionName = COALESCE($1, PromotionName), Description = COALESCE($2, Description),
          DiscountType = COALESCE($3, DiscountType), DiscountValue = COALESCE($4, DiscountValue),
          MinOrderAmount = COALESCE($5, MinOrderAmount), MaxDiscount = COALESCE($6, MaxDiscount),
          StartDate = COALESCE($7, StartDate), EndDate = COALESCE($8, EndDate),
          UsageLimit = $9
      WHERE PromotionId = $10 RETURNING *
    `;
    const updated = await pool.query(updateQuery, [
      promotionName,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      id,
    ]);

    if (updated.rows.length === 0)
      return res.status(404).json({ error: "Không tìm thấy khuyến mãi." });
    res.json({ message: "Cập nhật thành công!", promotion: updated.rows[0] });
  } catch (error) {
    console.error("Lỗi updatePromotion:", error);
    res.status(500).json({ error: "Lỗi cập nhật.", details: error.message });
  }
};

// [DELETE] /api/promotions/:id - Xóa mềm (Ngừng áp dụng)
const deletePromotion = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await pool.query(
      "UPDATE Promotion SET IsActive = FALSE WHERE PromotionId = $1 RETURNING *",
      [id],
    );
    if (deleted.rows.length === 0)
      return res.status(404).json({ error: "Không tìm thấy khuyến mãi." });
    res.json({ message: "Đã ngừng áp dụng khuyến mãi!" });
  } catch (error) {
    console.error("Lỗi deletePromotion:", error);
    res.status(500).json({ error: "Lỗi server.", details: error.message });
  }
};

// [GET] /api/promotions - Lấy danh sách tất cả khuyến mãi đang hoạt động (Public API)
const getAllActivePromotions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, v.VenueName, v.Address as VenueAddress 
       FROM Promotion p 
       JOIN Venue v ON p.VenueId = v.VenueId 
       WHERE p.IsActive = TRUE AND p.EndDate >= CURRENT_DATE 
       ORDER BY p.EndDate ASC`
    );
    res.json({
      message: "Lấy danh sách khuyến mãi thành công!",
      promotions: result.rows,
    });
  } catch (error) {
    console.error("Lỗi getAllActivePromotions:", error);
    res.status(500).json({ error: "Lỗi server.", details: error.message });
  }
};

module.exports = {
  getPromotionsByVenue,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getAllActivePromotions,
};
