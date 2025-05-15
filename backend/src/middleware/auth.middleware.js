const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { verifyToken } = require("../utils/jwt.utils");

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized Access" });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId, "-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized Access" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    next();
  };
};