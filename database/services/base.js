const bcrypt = require("bcrypt");

exports.hashPassword = async password => {
  return await bcrypt.hash(password, 12);
};

exports.confirmPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
