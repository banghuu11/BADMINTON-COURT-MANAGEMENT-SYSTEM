const pool = require("../config/db");

const FREE_LIMITS = {
  maxVenues: 1,
  maxCourtsPerVenue: 4,
  maxStaff: 2,
};

const getLimitsForOwner = async (db, ownerId) => {
  const result = await db.query(
    `SELECT sp.MaxVenues, sp.MaxCourtsPerVenue, sp.MaxStaff
     FROM OwnerSubscription os
     JOIN SubscriptionPlan sp ON sp.PlanId = os.PlanId
     WHERE os.OwnerId = $1
       AND os.Status = 'Active'
       AND os.StartDate <= CURRENT_DATE
       AND os.EndDate >= CURRENT_DATE
     ORDER BY os.CreatedAt DESC, os.SubscriptionId DESC
     LIMIT 1`,
    [ownerId],
  );

  if (result.rows.length === 0) return FREE_LIMITS;
  const plan = result.rows[0];
  return {
    maxVenues: plan.maxvenues,
    maxCourtsPerVenue: plan.maxcourtspervenue,
    maxStaff: plan.maxstaff,
  };
};

const enforceVenueLimit = async (req, res, next) => {
  if (Number(req.user.roleId) === 1) return next();
  try {
    const ownerResult = await pool.query(
      "SELECT OwnerId FROM CourtOwnerProfile WHERE UserId = $1",
      [req.user.userId],
    );
    if (ownerResult.rows.length === 0) {
      return res.status(403).json({ error: "Bạn chưa có hồ sơ chủ sân." });
    }

    const ownerId = ownerResult.rows[0].ownerid;
    const limits = await getLimitsForOwner(pool, ownerId);
    const countResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM Venue WHERE OwnerId = $1",
      [ownerId],
    );
    if (countResult.rows[0].count >= limits.maxVenues) {
      return res.status(403).json({
        error: `Gói hiện tại chỉ cho phép tối đa ${limits.maxVenues} cơ sở. Hãy nâng cấp gói để thêm cơ sở.`,
        code: "VENUE_LIMIT_REACHED",
      });
    }
    next();
  } catch (error) {
    console.error("Lỗi kiểm tra giới hạn cơ sở:", error);
    res.status(500).json({ error: "Không thể kiểm tra giới hạn gói dịch vụ." });
  }
};

const enforceCourtLimit = async (req, res, next) => {
  if (Number(req.user.roleId) === 1) return next();
  const venueId = Number(req.body.venueId);
  if (!Number.isInteger(venueId)) {
    return res.status(400).json({ error: "venueId không hợp lệ." });
  }

  try {
    const venueResult = await pool.query(
      "SELECT OwnerId FROM Venue WHERE VenueId = $1",
      [venueId],
    );
    if (venueResult.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy cơ sở." });
    }

    const limits = await getLimitsForOwner(pool, venueResult.rows[0].ownerid);
    const countResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM Court WHERE VenueId = $1",
      [venueId],
    );
    if (countResult.rows[0].count >= limits.maxCourtsPerVenue) {
      return res.status(403).json({
        error: `Gói hiện tại chỉ cho phép tối đa ${limits.maxCourtsPerVenue} sân cho mỗi cơ sở. Hãy nâng cấp gói để thêm sân.`,
        code: "COURT_LIMIT_REACHED",
      });
    }
    next();
  } catch (error) {
    console.error("Lỗi kiểm tra giới hạn sân:", error);
    res.status(500).json({ error: "Không thể kiểm tra giới hạn gói dịch vụ." });
  }
};

module.exports = { enforceVenueLimit, enforceCourtLimit, getLimitsForOwner, FREE_LIMITS };
