const pool = require("../config/db");

// [GET] /api/plans
const getPlans = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM SubscriptionPlan WHERE IsActive = true ORDER BY SortOrder ASC`,
    );
    res.json({
      message: "Lấy danh sách gói dịch vụ thành công!",
      plans: result.rows,
    });
  } catch (error) {
    console.error("Lỗi getPlans:", error);
    res
      .status(500)
      .json({
        error: "Lỗi server khi lấy gói dịch vụ.",
        details: error.message,
      });
  }
};

module.exports = { getPlans };
