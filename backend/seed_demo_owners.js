require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("./src/config/db");

const demoPassword = "Owner@123";

const owners = [
  ["demo_owner_01", "Lê Minh Khang", "Công ty Shuttle Sài Gòn", 2, "Monthly", 3],
  ["demo_owner_02", "Phạm Gia Huy", "Hệ thống sân Gia Huy Sport", 2, "Monthly", 3],
  ["demo_owner_03", "Võ Hoàng Nam", "Nam Việt Badminton", 5, "Yearly", 3],
  ["demo_owner_04", "Trần Ngọc Anh", "Ngọc Anh Sports Center", 2, "Monthly", 3],
  ["demo_owner_05", "Nguyễn Thảo Vy", "Thảo Vy Shuttle Club", 5, "Yearly", 3],
  ["demo_owner_06", "Đặng Quốc Bảo", "Quốc Bảo Badminton Group", 2, "Monthly", 3],
  ["demo_owner_07", "Bùi Thanh Tùng", "Thanh Tùng Sports", 2, "Monthly", 3],
  ["demo_owner_08", "Hồ Minh Châu", "Minh Châu Badminton", 5, "Yearly", 3],
  ["demo_owner_09", "Dương Thành Đạt", "CourtLink Enterprise Demo", 3, "Monthly", 6],
];

const seed = async () => {
  const client = await pool.connect();
  const totals = { usersCreated: 0, profilesCreated: 0, subscriptionsCreated: 0, invoicesCreated: 0, venuesAssigned: 0 };
  try {
    await client.query("BEGIN");
    const passwordHash = await bcrypt.hash(demoPassword, 10);
    const ownerProfiles = [];

    for (let index = 0; index < owners.length; index += 1) {
      const [username, fullName, businessName, planId, billingCycle, venueLimit] = owners[index];
      const phone = `0908${String(510000 + index * 137).padStart(6, "0")}`;
      const email = `${username}@demo.courtlink.vn`;

      let userResult = await client.query("SELECT UserId FROM AppUser WHERE Username = $1", [username]);
      if (userResult.rows.length === 0) {
        userResult = await client.query(
          `INSERT INTO AppUser
           (RoleId, Username, PasswordHash, FullName, PhoneNumber, Email, Gender, Address, IsActive, IsVerified)
           VALUES (2,$1,$2,$3,$4,$5,$6,'TP. Hồ Chí Minh',TRUE,TRUE)
           RETURNING UserId`,
          [username, passwordHash, fullName, phone, email, index % 3 === 1 ? "Nữ" : "Nam"],
        );
        totals.usersCreated += 1;
      }
      const userId = userResult.rows[0].userid;

      let profileResult = await client.query("SELECT OwnerId FROM CourtOwnerProfile WHERE UserId = $1", [userId]);
      if (profileResult.rows.length === 0) {
        profileResult = await client.query(
          `INSERT INTO CourtOwnerProfile
           (UserId, BusinessType, BusinessName, BusinessAddress, RepFullName, RepPosition,
            RepPhone, RepEmail, RepIdType, RepIdNumber, ProfileStatus, HasAcceptedTerms,
            AcceptedTermsAt, AcceptedTermsVersion, CurrentPlanId, PlanStartDate, PlanEndDate,
            SubscriptionStatus, BankName, BankAccount, BankOwner)
           VALUES
           ($1,'Business',$2,'TP. Hồ Chí Minh',$3,'Chủ cơ sở',$4,$5,'CCCD',$6,
            'Approved',TRUE,CURRENT_TIMESTAMP,'1.0',$7,CURRENT_DATE,
            CURRENT_DATE + INTERVAL '1 year','Active','MB',$8,$9)
           RETURNING OwnerId`,
          [
            userId,
            businessName,
            fullName,
            phone,
            email,
            `07920${String(1000000 + index).padStart(7, "0")}`,
            planId,
            `000${String(880000 + index * 17).padStart(7, "0")}`,
            fullName.toUpperCase(),
          ],
        );
        totals.profilesCreated += 1;
      }
      const ownerId = profileResult.rows[0].ownerid;

      await client.query(
        `UPDATE CourtOwnerProfile
         SET CurrentPlanId=$2, PlanStartDate=CURRENT_DATE,
             PlanEndDate=CURRENT_DATE + CASE WHEN $3::varchar='Yearly' THEN INTERVAL '1 year' ELSE INTERVAL '1 month' END,
             SubscriptionStatus='Active',
             ProfileStatus='Approved', UpdatedAt=CURRENT_TIMESTAMP
         WHERE OwnerId=$1`,
        [ownerId, planId, billingCycle],
      );

      const activeSubscription = await client.query(
        "SELECT SubscriptionId FROM OwnerSubscription WHERE OwnerId=$1 AND Status='Active' LIMIT 1",
        [ownerId],
      );
      if (activeSubscription.rows.length === 0) {
        const planResult = await client.query(
          "SELECT PricePerCycle FROM SubscriptionPlan WHERE PlanId=$1 AND IsActive=TRUE",
          [planId],
        );
        if (planResult.rows.length === 0) throw new Error(`Không tìm thấy gói ${planId}.`);
        const price = Number(planResult.rows[0].pricepercycle);
        const subscriptionResult = await client.query(
          `INSERT INTO OwnerSubscription
           (OwnerId,PlanId,BillingCycle,StartDate,EndDate,PriceCharged,DiscountAmount,Status,AutoRenew)
           VALUES ($1,$2,$3::varchar,CURRENT_DATE,
                   CURRENT_DATE + CASE WHEN $3::varchar='Yearly' THEN INTERVAL '1 year' ELSE INTERVAL '1 month' END,
                   $4,0,'Active',TRUE)
           RETURNING SubscriptionId`,
          [ownerId, planId, billingCycle, price],
        );
        const subscriptionId = subscriptionResult.rows[0].subscriptionid;
        totals.subscriptionsCreated += 1;

        await client.query(
          `INSERT INTO PlatformInvoice
           (OwnerId,SubscriptionId,InvoiceCode,PeriodFrom,PeriodTo,AmountBeforeVAT,VATRate,
            DueDate,PaymentStatus,PaidAt,PaymentMethod,PaymentRef,Note)
           VALUES ($1,$2,$3,CURRENT_DATE,
                   CURRENT_DATE + CASE WHEN $6::varchar='Yearly' THEN INTERVAL '1 year' ELSE INTERVAL '1 month' END,$4,0,
                   CURRENT_DATE,'Paid',CURRENT_TIMESTAMP,'DemoSeed',$5,'Hóa đơn dữ liệu demo')`,
          [ownerId, subscriptionId, `DEMO-SUB-${ownerId}-2026`, price, `SEED-${ownerId}-2026`, billingCycle],
        );
        totals.invoicesCreated += 1;
      }

      ownerProfiles.push({ ownerId, username, venueLimit });
    }

    const demoVenues = await client.query(
      `SELECT VenueId FROM Venue
       WHERE Email LIKE '%@demo.courtlink.vn'
       ORDER BY VenueId`,
    );
    let venueOffset = 0;
    for (const owner of ownerProfiles) {
      const assigned = demoVenues.rows.slice(venueOffset, venueOffset + owner.venueLimit);
      for (const venue of assigned) {
        await client.query("UPDATE Venue SET OwnerId=$1, UpdatedAt=CURRENT_TIMESTAMP WHERE VenueId=$2", [owner.ownerId, venue.venueid]);
        totals.venuesAssigned += 1;
      }
      venueOffset += owner.venueLimit;
    }
    if (venueOffset !== demoVenues.rows.length) {
      throw new Error(`Phân bổ thiếu cơ sở demo: đã phân ${venueOffset}/${demoVenues.rows.length}.`);
    }

    await client.query("COMMIT");
    console.log(JSON.stringify({ ...totals, demoAccounts: owners.length, demoPassword }));
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
