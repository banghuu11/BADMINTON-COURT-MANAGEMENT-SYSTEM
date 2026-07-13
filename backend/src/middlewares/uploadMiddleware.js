const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Đảm bảo thư mục lưu ảnh tồn tại (tạo ở gốc thư mục backend)
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer để lưu file vào ổ cứng
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const prefix =
      file.fieldname === "avatar"
        ? "avatar-"
        : file.fieldname === "banner"
          ? "banner-"
          : "venue-";
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn file 5MB
});

module.exports = upload;
