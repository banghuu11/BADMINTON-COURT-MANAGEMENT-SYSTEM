const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Chưa xác thực người dùng!" });
    }
    const roleId = Number(req.user.roleId);
    if (!allowedRoles.includes(roleId)) {
      return res.status(403).json({ error: "Bạn không có quyền truy cập chức năng này!" });
    }
    next();
  };
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Chưa xác thực người dùng!" });
  }
  if (Number(req.user.roleId) !== 1) {
    return res.status(403).json({ error: "Truy cập bị từ chối. Tính năng này chỉ dành cho Admin!" });
  }
  next();
};

const isOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Chưa xác thực người dùng!" });
  }
  if (Number(req.user.roleId) !== 2) {
    return res.status(403).json({ error: "Truy cập bị từ chối. Tính năng này chỉ dành cho Chủ sân!" });
  }
  next();
};

const isManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Chưa xác thực người dùng!" });
  }
  if (Number(req.user.roleId) !== 3) {
    return res.status(403).json({ error: "Truy cập bị từ chối. Tính năng này chỉ dành cho Quản lý cơ sở!" });
  }
  next();
};

const isStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Chưa xác thực người dùng!" });
  }
  if (Number(req.user.roleId) !== 4) {
    return res.status(403).json({ error: "Truy cập bị từ chối. Tính năng này chỉ dành cho Nhân viên!" });
  }
  next();
};

const isCustomer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Chưa xác thực người dùng!" });
  }
  if (Number(req.user.roleId) !== 5) {
    return res.status(403).json({ error: "Truy cập bị từ chối. Tính năng này chỉ dành cho Khách hàng!" });
  }
  next();
};

const isOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Chưa xác thực người dùng!" });
  }
  const roleId = Number(req.user.roleId);
  if (roleId !== 1 && roleId !== 2) {
    return res.status(403).json({ error: "Bạn không có quyền truy cập chức năng này!" });
  }
  next();
};

const isStaffOrAbove = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Chưa xác thực người dùng!" });
  }
  const roleId = Number(req.user.roleId);
  if (![1, 2, 3, 4].includes(roleId)) {
    return res.status(403).json({ error: "Bạn không có quyền truy cập chức năng này!" });
  }
  next();
};

module.exports = {
  requireRole,
  isAdmin,
  isOwner,
  isManager,
  isStaff,
  isCustomer,
  isOwnerOrAdmin,
  isStaffOrAbove,
};
