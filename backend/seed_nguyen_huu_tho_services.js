require("dotenv").config();
const pool = require("./src/config/db");

const categoryDefinitions = [
  ["Nước uống", "Nước suối, nước điện giải và nước tăng lực"],
  ["Cầu và phụ kiện", "Cầu lông và phụ kiện thi đấu"],
  ["Cho thuê dụng cụ", "Vợt, giày và vật dụng cho thuê theo buổi"],
  ["Đồ ăn nhẹ", "Đồ ăn nhanh phục vụ người chơi"],
  ["Huấn luyện và hỗ trợ", "Huấn luyện kỹ thuật và dịch vụ chuyên môn"],
];

const services = [
  ["Nước uống", "Nước suối Aquafina 500ml", "NHT-NUOC-01", 10000, 6000, "Chai", 120, false, null],
  ["Nước uống", "Revive chanh muối 500ml", "NHT-NUOC-02", 15000, 9500, "Chai", 80, false, null],
  ["Nước uống", "Pocari Sweat 500ml", "NHT-NUOC-03", 20000, 14000, "Chai", 60, false, null],
  ["Nước uống", "Nước dừa tươi", "NHT-NUOC-04", 25000, 15000, "Ly", 40, false, null],
  ["Nước uống", "Red Bull", "NHT-NUOC-05", 18000, 12000, "Lon", 50, false, null],
  ["Nước uống", "Cà phê sữa lon", "NHT-NUOC-06", 18000, 11000, "Lon", 40, false, null],
  ["Cầu và phụ kiện", "Cầu lông Yonex AS-30", "NHT-PK-01", 420000, 350000, "Ống", 24, false, null],
  ["Cầu và phụ kiện", "Cầu lông Hải Yến S70", "NHT-PK-02", 290000, 235000, "Ống", 30, false, null],
  ["Cầu và phụ kiện", "Cầu lông bán lẻ", "NHT-PK-03", 30000, 22000, "Quả", 100, false, null],
  ["Cầu và phụ kiện", "Quấn cán vợt", "NHT-PK-04", 30000, 16000, "Cái", 70, false, null],
  ["Cầu và phụ kiện", "Vớ cầu lông thể thao", "NHT-PK-05", 45000, 26000, "Đôi", 35, false, null],
  ["Cho thuê dụng cụ", "Thuê vợt cầu lông phổ thông", "NHT-THUE-01", 25000, 0, "Buổi", 20, true, 25000],
  ["Cho thuê dụng cụ", "Thuê vợt cầu lông cao cấp", "NHT-THUE-02", 50000, 0, "Buổi", 10, true, 50000],
  ["Cho thuê dụng cụ", "Thuê giày cầu lông", "NHT-THUE-03", 40000, 0, "Đôi/buổi", 16, true, 40000],
  ["Cho thuê dụng cụ", "Thuê khăn thể thao", "NHT-THUE-04", 15000, 3000, "Cái/buổi", 30, true, 15000],
  ["Đồ ăn nhẹ", "Xúc xích tiệt trùng", "NHT-AN-01", 15000, 8000, "Cây", 50, false, null],
  ["Đồ ăn nhẹ", "Thanh năng lượng ngũ cốc", "NHT-AN-02", 20000, 12000, "Thanh", 45, false, null],
  ["Đồ ăn nhẹ", "Mì trứng tại căn tin", "NHT-AN-03", 35000, 18000, "Phần", 40, false, null],
  ["Đồ ăn nhẹ", "Sandwich gà", "NHT-AN-04", 30000, 18000, "Phần", 30, false, null],
  ["Huấn luyện và hỗ trợ", "Huấn luyện cầu lông 1 kèm 1", "NHT-HL-01", 250000, 150000, "Giờ", 99, false, null],
  ["Huấn luyện và hỗ trợ", "Lớp kỹ thuật nhóm 4 người", "NHT-HL-02", 120000, 70000, "Người/giờ", 99, false, null],
  ["Huấn luyện và hỗ trợ", "Căng cước vợt tiêu chuẩn", "NHT-HL-03", 120000, 70000, "Vợt", 30, false, null],
];

const seed = async () => {
  const client = await pool.connect();
  const totals = { categoriesCreated: 0, servicesCreated: 0, servicesSkipped: 0 };
  try {
    await client.query("BEGIN");
    const venueResult = await client.query(
      "SELECT VenueId FROM Venue WHERE Slug = 'nguyen-huu-tho-badminton' LIMIT 1",
    );
    if (venueResult.rows.length === 0) throw new Error("Không tìm thấy cơ sở Nguyễn Hữu Thọ Badminton.");
    const venueId = venueResult.rows[0].venueid;
    const categoryIds = new Map();

    for (const [categoryName, description] of categoryDefinitions) {
      let categoryResult = await client.query(
        "SELECT CategoryId FROM ServiceCategory WHERE VenueId=$1 AND CategoryName=$2 LIMIT 1",
        [venueId, categoryName],
      );
      if (categoryResult.rows.length === 0) {
        categoryResult = await client.query(
          "INSERT INTO ServiceCategory (VenueId,CategoryName,Description) VALUES ($1,$2,$3) RETURNING CategoryId",
          [venueId, categoryName, description],
        );
        totals.categoriesCreated += 1;
      }
      categoryIds.set(categoryName, categoryResult.rows[0].categoryid);
    }

    for (const [categoryName, serviceName, sku, unitPrice, costPrice, unit, stock, isRentable, rentalPrice] of services) {
      const existing = await client.query(
        "SELECT ServiceId FROM ServiceItem WHERE VenueId=$1 AND SKU=$2 LIMIT 1",
        [venueId, sku],
      );
      if (existing.rows.length > 0) {
        totals.servicesSkipped += 1;
        continue;
      }
      await client.query(
        `INSERT INTO ServiceItem
         (VenueId,CategoryId,ServiceName,SKU,UnitPrice,CostPrice,Unit,StockQuantity,
          MinStockAlert,IsRentable,RentalPrice,IsActive)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,5,$9,$10,TRUE)`,
        [venueId, categoryIds.get(categoryName), serviceName, sku, unitPrice, costPrice, unit, stock, isRentable, rentalPrice],
      );
      totals.servicesCreated += 1;
    }

    await client.query("COMMIT");
    console.log(JSON.stringify({ venueId, ...totals }));
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
