const isAdmin = (req, res, next) => {
  // Kiểm tra quyền Admin (RoleId = 1 theo cấu trúc db.md)
  if (req.user.roleId !== 1) {
    return res
      .status(403)
      .json({
        error: "Truy cập bị từ chối. Tính năng này chỉ dành cho Admin!",
      });
  }
  next();
};

module.exports = { isAdmin };
