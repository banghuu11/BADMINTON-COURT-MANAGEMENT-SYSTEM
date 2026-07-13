const pool = require('./src/config/db');

async function seedData() {
  try {
    console.log("Bat dau seed...");
    
    // Check if there is an owner
    let ownerRes = await pool.query("SELECT * FROM CourtOwnerProfile LIMIT 1");
    let customerRes = await pool.query("SELECT * FROM AppUser WHERE RoleId = 5 LIMIT 1");

    // If no customer, create them!
    if (customerRes.rows.length === 0) {
      console.log("Creating Customer...");
      const cusInsert = await pool.query(`
        INSERT INTO AppUser (RoleId, Username, PasswordHash, FullName, Email, PhoneNumber)
        VALUES (5, 'customer_demo_' || floor(random() * 100000), '123456', 'Khach Hang Test', 'customer' || floor(random() * 100000) || '@gmail.com', '0123456789')
        RETURNING *
      `);
      customerRes = cusInsert;
    }

    if (ownerRes.rows.length === 0) {
      console.log("Creating Owner...");
      const ownerUserInsert = await pool.query(`
        INSERT INTO AppUser (RoleId, Username, PasswordHash, FullName, Email, PhoneNumber)
        VALUES (2, 'owner_demo_' || floor(random() * 100000), '123456', 'Chu San Test', 'owner' || floor(random() * 100000) || '@gmail.com', '0987654321')
        RETURNING UserId, FullName
      `);
      
      const ownerInsert = await pool.query(`
        INSERT INTO CourtOwnerProfile (UserId, RepFullName, BusinessName, Status)
        VALUES ($1, $2, 'He Thong San Test', 'Approved')
        RETURNING *
      `, [ownerUserInsert.rows[0].userid, ownerUserInsert.rows[0].fullname]);
      ownerRes = ownerInsert;
    }

    const owner1 = ownerRes.rows[0];
    const customer1 = customerRes.rows[0].userid;

    // Seed Venue
    console.log("Seeding Venue...");
    const venueInsert = await pool.query(`
      INSERT INTO Venue (OwnerId, VenueName, Address, District, City, OpenTime, CloseTime, Status)
      VALUES 
      ($1, 'Sân Cầu Lông Sky ' || floor(random() * 100), '123 Cộng Hòa', 'Tân Bình', 'TPHCM', '05:00', '23:00', 'Active'),
      ($1, 'Sân ProMax ' || floor(random() * 100), '456 Lê Văn Sỹ', 'Phú Nhuận', 'TPHCM', '06:00', '24:00', 'Active')
      RETURNING VenueId
    `, [owner1.ownerid]);

    const v1Id = venueInsert.rows[0].venueid;
    const v2Id = venueInsert.rows[1].venueid;

    // Seed Courts for Venue 1
    console.log("Seeding Courts...");
    await pool.query(`
      INSERT INTO Court (VenueId, CourtName, Status)
      VALUES 
      ($1, 'Sân 1', 'Active'),
      ($1, 'Sân 2', 'Active'),
      ($1, 'Sân VIP', 'Active')
    `, [v1Id]);

    // Seed Bookings
    console.log("Seeding Bookings...");
    const bookingRes = await pool.query(`
      INSERT INTO Booking (CustomerId, BookingCode, BookingType, BookingStatus, Note)
      VALUES 
      ($1, 'BK' || floor(random() * 100000), 'One-time', 'Completed', 'Test seed data'),
      ($1, 'BK' || floor(random() * 100000), 'One-time', 'Completed', 'Test seed data 2')
      RETURNING BookingId
    `, [customer1]);

    const b1 = bookingRes.rows[0].bookingid;
    const b2 = bookingRes.rows[1].bookingid;

    // Seed Reviews
    console.log("Seeding Reviews...");
    await pool.query(`
      INSERT INTO Review (VenueId, UserId, BookingId, Rating, Title, Comment, CourtRating, ServiceRating, StaffRating, IsAnonymous, Status)
      VALUES 
      ($1, $2, $3, 5, 'Sân rất đẹp và sạch sẽ', 'Thảm mới, đèn sáng không bị chói. Rất đáng tiền.', 5, 5, 5, false, 'Approved'),
      ($4, $2, $5, 4, 'Nhân viên nhiệt tình', 'Gửi xe hơi chật nhưng sân đẹp, chơi êm chân', 4, 3, 5, false, 'Approved')
    `, [v1Id, customer1, b1, v2Id, b2]);

    console.log("Seeding hoan tat thanh cong!");
    process.exit(0);

  } catch (error) {
    console.error("Loi:", error);
    process.exit(1);
  }
}

seedData();
