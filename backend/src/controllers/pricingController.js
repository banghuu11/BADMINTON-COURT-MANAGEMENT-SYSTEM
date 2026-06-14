const pool = require("../config/db");

// [POST] /api/pricing - Tạo cấu hình giá mới
const createPricing = async (req, res) => {
  const {
    courtId,
    slotName,
    dayType,
    startTime,
    endTime,
    price,
    effectiveFrom,
    effectiveTo,
  } = req.body;

  if (!courtId || !slotName || !startTime || !endTime || !price) {
    return res.status(400).json({
      error: "Vui lòng nhập đầy đủ CourtId, Tên ca, Thời gian và Giá!",
    });
  }

  try {
    const insertQuery = `
      INSERT INTO TimeSlotPricing (CourtId, SlotName, DayType, StartTime, EndTime, Price, EffectiveFrom, EffectiveTo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `;
    const values = [
      courtId,
      slotName,
      dayType || "Weekday",
      startTime,
      endTime,
      price,
      effectiveFrom || null,
      effectiveTo || null,
    ];
    const newPricing = await pool.query(insertQuery, values);

    res.status(201).json({
      message: "Cấu hình giá thành công!",
      pricing: newPricing.rows[0],
    });
  } catch (error) {
    console.error("Lỗi createPricing:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi tạo giá.", details: error.message });
  }
};

// [GET] /api/pricing/court/:courtId - Lấy danh sách bảng giá của 1 sân
const getPricingByCourt = async (req, res) => {
  const { courtId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM TimeSlotPricing WHERE CourtId = $1 AND IsActive = true ORDER BY StartTime ASC",
      [courtId],
    );
    res.json({ message: "Lấy bảng giá thành công!", pricingList: result.rows });
  } catch (error) {
    console.error("Lỗi getPricingByCourt:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi lấy bảng giá.", details: error.message });
  }
};

// [DELETE] /api/pricing/:id - Vô hiệu hóa (xóa mềm) cấu hình giá
const deletePricing = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await pool.query(
      "UPDATE TimeSlotPricing SET IsActive = false WHERE PricingId = $1 RETURNING *",
      [id],
    );
    if (deleted.rows.length === 0)
      return res.status(404).json({ error: "Không tìm thấy cấu hình giá." });
    res.json({ message: "Đã xóa cấu hình giá thành công!" });
  } catch (error) {
    console.error("Lỗi deletePricing:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi xóa giá.", details: error.message });
  }
};

module.exports = { createPricing, getPricingByCourt, deletePricing };
