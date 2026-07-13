const pool = require("../config/db");

// [POST] /api/reviews - Đăng đánh giá mới
const createReview = async (req, res) => {
  const userId = req.user.userId;
  const {
    venueId,
    bookingId,
    rating,
    title,
    comment,
    courtRating,
    serviceRating,
    staffRating,
    isAnonymous,
  } = req.body;

  if (!venueId || !rating || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ error: "Vui lòng cung cấp VenueId và Rating (từ 1 đến 5 sao)!" });
  }

  try {
    // Thực tế nên set Status là 'Pending' để Admin duyệt, nhưng để bạn dễ test ta tạm set 'Approved' luôn.
    const insertQuery = `
      INSERT INTO Review (VenueId, UserId, BookingId, Rating, Title, Comment, CourtRating, ServiceRating, StaffRating, IsAnonymous, Status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Approved') RETURNING *
    `;

    const values = [
      venueId,
      userId,
      bookingId || null,
      rating,
      title || null,
      comment || null,
      courtRating || null,
      serviceRating || null,
      staffRating || null,
      isAnonymous || false,
    ];

    const newReview = await pool.query(insertQuery, values);
    res
      .status(201)
      .json({ message: "Đánh giá thành công!", review: newReview.rows[0] });
  } catch (error) {
    console.error("Lỗi createReview:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi tạo đánh giá.", details: error.message });
  }
};

// [GET] /api/reviews/venue/:venueId - Lấy danh sách đánh giá của một cơ sở
const getVenueReviews = async (req, res) => {
  const { venueId } = req.params;

  try {
    // Dùng CASE WHEN để tự động ẩn tên và avatar nếu người dùng chọn ẩn danh
    const query = `
      SELECT r.ReviewId, r.Rating, r.Title, r.Comment, r.CourtRating, r.ServiceRating, r.StaffRating, r.CreatedAt, r.OwnerReply, r.OwnerRepliedAt,
             CASE WHEN r.IsAnonymous THEN 'Người dùng ẩn danh' ELSE u.FullName END AS ReviewerName,
             CASE WHEN r.IsAnonymous THEN NULL ELSE u.AvatarUrl END AS ReviewerAvatar
      FROM Review r
      JOIN AppUser u ON r.UserId = u.UserId
      WHERE r.VenueId = $1 AND r.Status = 'Approved'
      ORDER BY r.CreatedAt DESC
    `;
    const result = await pool.query(query, [venueId]);
    res.json({
      message: "Lấy danh sách đánh giá thành công!",
      reviews: result.rows,
    });
  } catch (error) {
    console.error("Lỗi getVenueReviews:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi lấy đánh giá.", details: error.message });
  }
};

// [GET] /api/reviews/owner - Lấy danh sách đánh giá của các cơ sở thuộc Chủ sân
const getOwnerReviews = async (req, res) => {
  const userId = req.user.userId;

  try {
    const query = `
      SELECT r.ReviewId, r.Rating, r.Title, r.Comment, r.CourtRating, r.ServiceRating, r.StaffRating, r.CreatedAt, r.OwnerReply, r.OwnerRepliedAt,
             CASE WHEN r.IsAnonymous THEN 'Người dùng ẩn danh' ELSE u.FullName END AS ReviewerName,
             CASE WHEN r.IsAnonymous THEN NULL ELSE u.AvatarUrl END AS ReviewerAvatar,
             v.VenueName
      FROM Review r
      JOIN AppUser u ON r.UserId = u.UserId
      JOIN Venue v ON r.VenueId = v.VenueId
      JOIN CourtOwnerProfile cop ON v.OwnerId = cop.OwnerId
      WHERE cop.UserId = $1 AND r.Status = 'Approved'
      ORDER BY r.CreatedAt DESC
    `;
    const result = await pool.query(query, [userId]);
    res.json({
      message: "Lấy danh sách đánh giá thành công!",
      reviews: result.rows,
    });
  } catch (error) {
    console.error("Lỗi getOwnerReviews:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi lấy đánh giá của chủ sân.", details: error.message });
  }
};

// [PATCH] /api/reviews/:reviewId/reply - Chủ sân trả lời đánh giá
const replyToReview = async (req, res) => {
  const { reviewId } = req.params;
  const { reply } = req.body;
  const userId = req.user.userId;

  if (!reply) {
    return res.status(400).json({ error: "Vui lòng nhập nội dung trả lời!" });
  }

  try {
    // 1. Kiểm tra xem user hiện tại có phải là Chủ sân của Cơ sở bị đánh giá không
    const checkOwnerQuery = `
      SELECT r.ReviewId 
      FROM Review r
      JOIN Venue v ON r.VenueId = v.VenueId
      JOIN CourtOwnerProfile cop ON v.OwnerId = cop.OwnerId
      WHERE r.ReviewId = $1 AND cop.UserId = $2
    `;
    const ownerCheck = await pool.query(checkOwnerQuery, [reviewId, userId]);

    if (ownerCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Truy cập từ chối! Bạn không phải chủ của cơ sở này." });
    }

    // 2. Cập nhật câu trả lời của chủ sân
    const updateQuery = `
      UPDATE Review
      SET OwnerReply = $1, OwnerRepliedAt = CURRENT_TIMESTAMP
      WHERE ReviewId = $2 RETURNING *
    `;
    const updatedReview = await pool.query(updateQuery, [reply, reviewId]);

    res.json({
      message: "Trả lời đánh giá thành công!",
      review: updatedReview.rows[0],
    });
  } catch (error) {
    console.error("Lỗi replyToReview:", error);
    res
      .status(500)
      .json({
        error: "Lỗi server khi trả lời đánh giá.",
        details: error.message,
      });
  }
};

module.exports = { createReview, getVenueReviews, getOwnerReviews, replyToReview };
