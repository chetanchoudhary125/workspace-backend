const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.memberRole) {
      return res
        .status(500)
        .json({ message: "checkWorkspaceMember must run before checkRole" });
    }

    if (!allowedRoles.includes(req.memberRole)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${req.memberRole}`,
      });
    }

    next();
  };
};

export default checkRole;
