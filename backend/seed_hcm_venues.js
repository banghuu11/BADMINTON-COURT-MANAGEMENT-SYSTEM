require("dotenv").config();
const pool = require("./src/config/db");

const venues = [
  ["Saigon Shuttle Nguyễn Huệ", "saigon-shuttle-nguyen-hue", "18 Nguyễn Huệ", "Bến Nghé", "Quận 1", 10.7742, 106.7038, 6, "Cụm sân trung tâm, phòng thay đồ hiện đại và khu nghỉ máy lạnh."],
  ["Diamond Badminton Võ Văn Tần", "diamond-badminton-vo-van-tan", "215 Võ Văn Tần", "Phường 5", "Quận 3", 10.7711, 106.6847, 5, "Sân thảm thi đấu, trần cao, phù hợp tập luyện và giao lưu."],
  ["Bến Vân Đồn Badminton Hub", "ben-van-don-badminton-hub", "312 Bến Vân Đồn", "Phường 2", "Quận 4", 10.7581, 106.6943, 6, "Không gian thoáng, có bãi xe và khu bán dụng cụ cầu lông."],
  ["Chợ Lớn Smash Center", "cho-lon-smash-center", "428 Trần Hưng Đạo", "Phường 11", "Quận 5", 10.7547, 106.6678, 7, "Cụm sân phong trào lớn, có lớp học cho người mới bắt đầu."],
  ["Bình Phú Shuttle Club", "binh-phu-shuttle-club", "96 Bình Phú", "Phường 11", "Quận 6", 10.7419, 106.6358, 5, "Sân tiêu chuẩn với hệ thống đèn chống chói và căn tin."],
  ["Phú Mỹ Hưng Badminton Arena", "phu-my-hung-badminton-arena", "45 Nguyễn Thị Thập", "Tân Phú", "Quận 7", 10.7306, 106.7217, 8, "Cụm sân cao cấp có điều hòa, phòng tắm và cửa hàng thể thao."],
  ["Rạch Ông Sports Hall", "rach-ong-sports-hall", "155 Dương Bá Trạc", "Phường 1", "Quận 8", 10.7386, 106.6872, 5, "Sân trong nhà thoáng mát, phù hợp nhóm bạn và câu lạc bộ."],
  ["Vạn Hạnh Badminton Complex", "van-hanh-badminton-complex", "289 Sư Vạn Hạnh", "Phường 12", "Quận 10", 10.7704, 106.6691, 7, "Tổ hợp sân cầu lông gần trung tâm với nhiều khung giờ linh hoạt."],
  ["Lữ Gia Shuttle House", "lu-gia-shuttle-house", "72 Lữ Gia", "Phường 15", "Quận 11", 10.7631, 106.6552, 6, "Sân phong trào, có cho thuê vợt và bán cầu tại quầy."],
  ["An Sương Badminton Station", "an-suong-badminton-station", "28 Trường Chinh", "Tân Thới Nhất", "Quận 12", 10.8316, 106.6185, 8, "Cụm sân rộng, bãi đỗ ô tô và hoạt động từ sáng sớm."],
  ["Pearl Shuttle Bình Thạnh", "pearl-shuttle-binh-thanh", "180 Điện Biên Phủ", "Phường 22", "Bình Thạnh", 10.7968, 106.7156, 6, "Sân thảm cao cấp, gần khu trung tâm và có khu vực khởi động."],
  ["Xô Viết Nghệ Tĩnh Badminton", "xo-viet-nghe-tinh-badminton", "525 Xô Viết Nghệ Tĩnh", "Phường 26", "Bình Thạnh", 10.8111, 106.7123, 5, "Sân cộng đồng với mức giá hợp lý và nhiều câu lạc bộ hoạt động."],
  ["Cityland Smash Gò Vấp", "cityland-smash-go-vap", "168 Phan Văn Trị", "Phường 10", "Gò Vấp", 10.8288, 106.6782, 8, "Tổ hợp sân mới, đèn LED chống chói và khu chờ rộng rãi."],
  ["Quang Trung Shuttle Club", "quang-trung-shuttle-club", "612 Quang Trung", "Phường 11", "Gò Vấp", 10.8394, 106.6588, 6, "Sân phong trào đông vui, phù hợp tổ chức giải nội bộ."],
  ["Cộng Hòa Badminton Zone", "cong-hoa-badminton-zone", "225 Cộng Hòa", "Phường 13", "Tân Bình", 10.8016, 106.6451, 7, "Cụm sân gần sân bay, có phòng tắm và chỗ gửi xe rộng."],
  ["Bàu Cát Shuttle Arena", "bau-cat-shuttle-arena", "118 Bàu Cát", "Phường 14", "Tân Bình", 10.7917, 106.6421, 5, "Sân trần cao, thông gió tốt và có huấn luyện viên theo giờ."],
  ["Celadon Badminton Park", "celadon-badminton-park", "36 Tân Thắng", "Sơn Kỳ", "Tân Phú", 10.8021, 106.6177, 8, "Cụm sân cao cấp gần công viên, có điều hòa và khu thư giãn."],
  ["Lũy Bán Bích Shuttle", "luy-ban-bich-shuttle", "410 Lũy Bán Bích", "Hòa Thạnh", "Tân Phú", 10.7815, 106.6311, 6, "Sân tiêu chuẩn thi đấu với giá linh hoạt theo khung giờ."],
  ["Gia Định Badminton Club", "gia-dinh-badminton-club", "88 Hoàng Văn Thụ", "Phường 9", "Phú Nhuận", 10.7993, 106.6751, 6, "Câu lạc bộ lâu năm, thuận tiện di chuyển từ khu vực sân bay."],
  ["Phan Xích Long Smash House", "phan-xich-long-smash-house", "145 Phan Xích Long", "Phường 7", "Phú Nhuận", 10.7974, 106.6873, 5, "Sân boutique sạch đẹp, có tủ đồ và khu nước uống."],
  ["Tên Lửa Badminton Center", "ten-lua-badminton-center", "205 Đường Tên Lửa", "Bình Trị Đông B", "Bình Tân", 10.7512, 106.6117, 8, "Cụm sân lớn khu Tây, bãi xe rộng và nhiều sân VIP."],
  ["Kinh Dương Vương Shuttle", "kinh-duong-vuong-shuttle", "620 Kinh Dương Vương", "An Lạc", "Bình Tân", 10.7275, 106.5994, 6, "Sân trong nhà thoáng, phục vụ từ sáng đến khuya."],
  ["Thảo Điền Badminton Loft", "thao-dien-badminton-loft", "92 Quốc Hương", "Thảo Điền", "Thành phố Thủ Đức", 10.8049, 106.7372, 6, "Không gian hiện đại, sân máy lạnh và dịch vụ thuê dụng cụ."],
  ["Sala Shuttle Arena", "sala-shuttle-arena", "28 Mai Chí Thọ", "An Lợi Đông", "Thành phố Thủ Đức", 10.7708, 106.7298, 8, "Cụm sân cao cấp, phù hợp tổ chức giải và sự kiện doanh nghiệp."],
  ["Linh Trung Badminton Campus", "linh-trung-badminton-campus", "115 Hoàng Diệu 2", "Linh Trung", "Thành phố Thủ Đức", 10.8587, 106.7684, 7, "Sân giá sinh viên, nhiều câu lạc bộ và lớp học cơ bản."],
  ["Hiệp Bình Chánh Shuttle", "hiep-binh-chanh-shuttle", "240 Phạm Văn Đồng", "Hiệp Bình Chánh", "Thành phố Thủ Đức", 10.8292, 106.7245, 6, "Sân mới trên trục Phạm Văn Đồng, bãi xe và căn tin rộng."],
  ["Nguyễn Hữu Thọ Badminton", "nguyen-huu-tho-badminton", "650 Nguyễn Hữu Thọ", "Phước Kiển", "Nhà Bè", 10.7043, 106.7048, 6, "Cụm sân khu Nam, không gian rộng và thoáng tự nhiên."],
  ["Trung Chánh Shuttle Center", "trung-chanh-shuttle-center", "76 Nguyễn Ảnh Thủ", "Trung Chánh", "Hóc Môn", 10.8564, 106.6079, 7, "Sân phong trào quy mô lớn, có khu ăn uống và đỗ ô tô."],
  ["Tân Túc Badminton Garden", "tan-tuc-badminton-garden", "118 Nguyễn Hữu Trí", "Tân Túc", "Bình Chánh", 10.6874, 106.5742, 6, "Sân xanh ngoại thành, trần cao và giá tốt cho nhóm đông."],
  ["Củ Chi Shuttle Village", "cu-chi-shuttle-village", "225 Tỉnh Lộ 8", "Tân An Hội", "Củ Chi", 10.9672, 106.4872, 5, "Cụm sân cộng đồng, phù hợp giao lưu cuối tuần và giải phong trào."],
];

const imageFiles = [
  "banner-1783931708579-106435840.png",
  "banner-1784693355987-74138377.jpg",
  "banner-1784693220206-566067624.jpeg",
  "banner-1783931673525-923390766.jpg",
  "venue-1782809026989-656087254.png",
];

const amenities = [
  ["Bãi đỗ xe", "ParkingCircle"],
  ["Phòng thay đồ", "Shirt"],
  ["Wifi miễn phí", "Wifi"],
  ["Cho thuê vợt", "BadgeCheck"],
  ["Căn tin", "Coffee"],
  ["Phòng tắm", "ShowerHead"],
  ["Điều hòa", "Snowflake"],
  ["Cửa hàng dụng cụ", "ShoppingBag"],
];

const surfaces = ["PVC 4.5mm", "Thảm Yonex", "Thảm Enlio", "Sàn gỗ phủ PU"];

const seed = async () => {
  const client = await pool.connect();
  const totals = { venues: 0, courts: 0, pricing: 0, amenities: 0, images: 0, skipped: 0 };
  try {
    await client.query("BEGIN");
    const ownerResult = await client.query(
      `SELECT cop.OwnerId
       FROM CourtOwnerProfile cop
       JOIN AppUser u ON u.UserId = cop.UserId
       WHERE u.FullName = 'Nguyễn Văn Chủ'
       ORDER BY cop.OwnerId LIMIT 1`,
    );
    if (ownerResult.rows.length === 0) throw new Error("Không tìm thấy owner Nguyễn Văn Chủ.");
    const ownerId = ownerResult.rows[0].ownerid;

    for (let venueIndex = 0; venueIndex < venues.length; venueIndex += 1) {
      const [name, slug, address, ward, district, latitude, longitude, courtCount, description] = venues[venueIndex];
      const existing = await client.query("SELECT VenueId FROM Venue WHERE Slug = $1", [slug]);
      if (existing.rows.length > 0) {
        totals.skipped += 1;
        continue;
      }

      const venueResult = await client.query(
        `INSERT INTO Venue
         (OwnerId, VenueName, Slug, Address, Ward, District, City, Latitude, Longitude,
          PhoneNumber, Email, Description, OpenTime, CloseTime, Status)
         VALUES ($1,$2,$3,$4,$5,$6,'TP. Hồ Chí Minh',$7,$8,$9,$10,$11,$12,$13,'Active')
         RETURNING VenueId`,
        [
          ownerId,
          name,
          slug,
          address,
          ward,
          district,
          latitude,
          longitude,
          `028${String(73000000 + venueIndex * 137).padStart(8, "0")}`,
          `${slug}@demo.courtlink.vn`,
          description,
          venueIndex % 3 === 0 ? "05:00" : "06:00",
          venueIndex % 4 === 0 ? "23:30" : "23:00",
        ],
      );
      const venueId = venueResult.rows[0].venueid;
      totals.venues += 1;

      const imageUrl = `http://localhost:8080/uploads/${imageFiles[venueIndex % imageFiles.length]}`;
      await client.query(
        `INSERT INTO VenueImage (VenueId, ImageUrl, Caption, SortOrder, IsMain)
         VALUES ($1, $2, $3, 0, TRUE)`,
        [venueId, imageUrl, `Không gian ${name}`],
      );
      totals.images += 1;

      const selectedAmenities = amenities.filter((_, index) => (index + venueIndex) % 4 !== 0);
      for (const [amenityName, iconName] of selectedAmenities) {
        await client.query(
          "INSERT INTO VenueAmenity (VenueId, AmenityName, IconName, IsAvailable) VALUES ($1,$2,$3,TRUE)",
          [venueId, amenityName, iconName],
        );
        totals.amenities += 1;
      }

      const basePrice = 55000 + (venueIndex % 6) * 5000;
      for (let courtIndex = 1; courtIndex <= courtCount; courtIndex += 1) {
        const isVip = courtIndex === courtCount && venueIndex % 2 === 1;
        const courtResult = await client.query(
          `INSERT INTO Court
           (VenueId, CourtName, CourtCode, SurfaceType, Length, Width, IsIndoor, HasAC, Status, Notes)
           VALUES ($1,$2,$3,$4,13.4,6.1,TRUE,$5,'Active',$6)
           RETURNING CourtId`,
          [
            venueId,
            isVip ? `Sân VIP ${courtIndex}` : `Sân ${courtIndex}`,
            `HCM-${venueId}-${String(courtIndex).padStart(2, "0")}`,
            surfaces[(venueIndex + courtIndex) % surfaces.length],
            isVip || (venueIndex % 5 === 0 && courtIndex <= 2),
            isVip ? "Sân VIP có ghế chờ riêng và điều hòa." : "Sân tiêu chuẩn phong trào và tập luyện.",
          ],
        );
        const courtId = courtResult.rows[0].courtid;
        totals.courts += 1;

        const vipExtra = isVip ? 20000 : 0;
        await client.query(
          `INSERT INTO TimeSlotPricing
           (CourtId, SlotName, DayType, StartTime, EndTime, Price, IsActive)
           VALUES
             ($1,'Giờ thấp điểm','All','05:00','17:00',$2,TRUE),
             ($1,'Giờ cao điểm','All','17:00','23:30',$3,TRUE)`,
          [courtId, basePrice + vipExtra, basePrice + 35000 + vipExtra],
        );
        totals.pricing += 2;
      }
    }

    await client.query("COMMIT");
    console.log(JSON.stringify(totals));
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
