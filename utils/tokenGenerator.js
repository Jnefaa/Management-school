const jwt = require("jsonwebtoken");
//generate token 
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "6d" });
};

module.exports = generateToken;
