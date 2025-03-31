const checkAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

const checkHospital = (req, res, next) => {
  if (req.user.role !== "hospital") {
    return res.status(403).json({ message: "Access denied. Hospitals only." });
  }
  next();
};

export { checkAdmin, checkHospital };
