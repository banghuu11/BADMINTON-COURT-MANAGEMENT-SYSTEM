require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("./src/config/db");

const demoPassword = "Player@123";
const players = [
  ["match_player_01", "Nguyễn Minh Quân", "Mới chơi"],
  ["match_player_02", "Trần Hải Yến", "Trung bình"],
  ["match_player_03", "Lê Quốc Anh", "Khá"],
  ["match_player_04", "Phạm Thu Trang", "Trung bình"],
  ["match_player_05", "Võ Đức Huy", "Nâng cao"],
  ["match_player_06", "Bùi Ngọc Mai", "Mới chơi"],
  ["match_player_07", "Đặng Thanh Phong", "Khá"],
  ["match_player_08", "Hồ Mỹ Linh", "Trung bình"],
  ["match_player_09", "Dương Tuấn Kiệt", "Nâng cao"],
  ["match_player_10", "Ngô Khánh Vy", "Khá"],
  ["match_player_11", "Đỗ Thành Long", "Trung bình"],
  ["match_player_12", "Lý Bảo Ngọc", "Mới chơi"],
  ["match_player_13", "Mai Anh Khoa", "Khá"],
  ["match_player_14", "Tạ Phương Thảo", "Trung bình"],
  ["match_player_15", "Vũ Hoàng Sơn", "Nâng cao"],
];

const timeSlots = [
  ["06:00", "07:30", 70000],
  ["08:00", "09:30", 75000],
  ["10:00", "11:30", 70000],
  ["14:00", "15:30", 75000],
  ["17:00", "18:30", 110000],
  ["19:00", "20:30", 120000],
  ["20:30", "22:00", 120000],
];

const seed = async () => {
  const client = await pool.connect();
  const totals = { playersCreated: 0, matchesCreated: 0, matchesSkipped: 0, pricingCreated: 0 };
  try {
    await client.query("BEGIN");
    const passwordHash = await bcrypt.hash(demoPassword, 10);
    const playerIds = [];

    for (let index = 0; index < players.length; index += 1) {
      const [username, fullName, skillLevel] = players[index];
      let userResult = await client.query("SELECT UserId FROM AppUser WHERE Username=$1", [username]);
      if (userResult.rows.length === 0) {
        userResult = await client.query(
          `INSERT INTO AppUser
           (RoleId,Username,PasswordHash,FullName,PhoneNumber,Email,Gender,Address,
            IsActive,IsVerified,SkillLevel)
           VALUES (5,$1,$2,$3,$4,$5,$6,'TP. Hồ Chí Minh',TRUE,TRUE,$7)
           RETURNING UserId`,
          [
            username,
            passwordHash,
            fullName,
            `0917${String(610000 + index * 149).padStart(6, "0")}`,
            `${username}@demo.courtlink.vn`,
            index % 3 === 1 ? "Nữ" : "Nam",
            skillLevel,
          ],
        );
        totals.playersCreated += 1;
      }
      playerIds.push(userResult.rows[0].userid);
    }

    const courtResult = await client.query(
      `SELECT c.CourtId
       FROM Court c
       JOIN Venue v ON v.VenueId=c.VenueId
       WHERE c.Status IN ('Active','Available') AND v.Status='Active'
         AND v.City IN ('TP. Hồ Chí Minh','TPHCM','Hồ Chí Minh')
       ORDER BY c.CourtId
       LIMIT 60`,
    );
    if (courtResult.rows.length < 60) throw new Error("Không đủ 60 sân hoạt động để tạo kèo demo.");

    for (let index = 0; index < 60; index += 1) {
      const bookingCode = `MATCH-DEMO-${String(index + 1).padStart(3, "0")}`;
      const existing = await client.query("SELECT BookingId FROM Booking WHERE BookingCode=$1", [bookingCode]);
      if (existing.rows.length > 0) {
        totals.matchesSkipped += 1;
        continue;
      }

      const playerId = playerIds[index % playerIds.length];
      const courtId = courtResult.rows[index].courtid;
      const [startTime, endTime, price] = timeSlots[index % timeSlots.length];
      const dayOffset = 1 + (index % 20);
      const isSingles = index % 4 === 0;
      const note = isSingles ? "Đánh đơn" : "Tìm đồng đội đánh đôi";
      const positionIndex = isSingles ? 0 : index % 4;

      const pricingExists = await client.query(
        `SELECT PricingId FROM TimeSlotPricing
         WHERE CourtId=$1 AND StartTime=$2::time AND EndTime=$3::time AND IsActive=TRUE
         LIMIT 1`,
        [courtId, startTime, endTime],
      );
      if (pricingExists.rows.length === 0) {
        await client.query(
          `INSERT INTO TimeSlotPricing
           (CourtId,SlotName,DayType,StartTime,EndTime,Price,IsActive)
           VALUES ($1,'Kèo giao lưu 90 phút','All',$2::time,$3::time,$4,TRUE)`,
          [courtId, startTime, endTime, price],
        );
        totals.pricingCreated += 1;
      }

      const bookingResult = await client.query(
        `INSERT INTO Booking
         (CustomerId,BookingCode,BookingType,Source,Note,DepositAmount,BookingStatus)
         VALUES ($1,$2,'Onetime','DemoSeed',$3,0,'Pending')
         RETURNING BookingId`,
        [playerId, bookingCode, note],
      );
      const bookingId = bookingResult.rows[0].bookingid;
      await client.query(
        `INSERT INTO BookingSlot
         (BookingId,CourtId,PlayDate,StartTime,EndTime,AppliedPrice,SlotStatus,PositionIndex)
         VALUES ($1,$2,CURRENT_DATE+$3::int,$4::time,$5::time,$6,'NotStarted',$7)`,
        [bookingId, courtId, dayOffset, startTime, endTime, price, positionIndex],
      );
      await client.query(
        `INSERT INTO WaitingList
         (CustomerId,CourtId,PlayDate,StartTime,EndTime,Status)
         VALUES ($1,$2,CURRENT_DATE+$3::int,$4::time,$5::time,'Waiting')`,
        [playerId, courtId, dayOffset, startTime, endTime],
      );
      totals.matchesCreated += 1;
    }

    await client.query("COMMIT");
    console.log(JSON.stringify({ ...totals, demoPassword }));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
