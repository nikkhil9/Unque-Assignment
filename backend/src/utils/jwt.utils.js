const jwt = require('jsonwebtoken');

exports.generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET);
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};