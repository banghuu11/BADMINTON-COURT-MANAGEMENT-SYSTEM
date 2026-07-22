const pool = require("../config/db");

const isAdmin = (user) => Number(user?.roleId) === 1;

const ownsVenue = async (user, venueId) => {
  if (isAdmin(user)) return true;
  const result = await pool.query(
    `SELECT 1 FROM Venue v JOIN CourtOwnerProfile cop ON cop.OwnerId = v.OwnerId
     WHERE v.VenueId = $1 AND cop.UserId = $2`,
    [venueId, user.userId],
  );
  return result.rows.length > 0;
};

const ownsResource = async (user, id, table, idColumn, joinSql) => {
  if (isAdmin(user)) return true;
  const result = await pool.query(
    `SELECT 1 FROM ${table} r ${joinSql}
     JOIN CourtOwnerProfile cop ON cop.OwnerId = v.OwnerId
     WHERE r.${idColumn} = $1 AND cop.UserId = $2`,
    [id, user.userId],
  );
  return result.rows.length > 0;
};

const ownsService = (user, id) => ownsResource(user, id, "ServiceItem", "ServiceId", "JOIN Venue v ON v.VenueId = r.VenueId");
const ownsPromotion = (user, id) => ownsResource(user, id, "Promotion", "PromotionId", "JOIN Venue v ON v.VenueId = r.VenueId");
const ownsCourt = (user, id) => ownsResource(user, id, "Court", "CourtId", "JOIN Venue v ON v.VenueId = r.VenueId");
const ownsPricing = (user, id) => ownsResource(user, id, "TimeSlotPricing", "PricingId", "JOIN Court c ON c.CourtId = r.CourtId JOIN Venue v ON v.VenueId = c.VenueId");

module.exports = { ownsVenue, ownsService, ownsPromotion, ownsCourt, ownsPricing };
