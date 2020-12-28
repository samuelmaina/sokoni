const bcrypt = require("bcrypt");

const ENCRYPTION_ROUNDS = 12;

exports.hashPassword = async password => {
  return await bcrypt.hash(password, ENCRYPTION_ROUNDS);
};

exports.confirmPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const ranges = {
  name: [5, 20],
  email: [8, 30],
  password: [8, 20],
  //tel is standard for all country( 13 numbers long)
  tel: 13,
};
const errorMessages = {
  nonString: "Non-string fields not allowed.",
  name: `Name should be ${ranges.name[0]}-${ranges.name[1]} characters long.`,
  email: `Email should be ${ranges.email[0]}-${ranges.email[1]} characters long.`,
  password: `Password should be ${ranges.password[0]}-${ranges.password[1]} characters long.`,
  tel: `Tel should be ${ranges.tel} characters long.`,
};
exports.errorMessages = errorMessages;
exports.ranges = ranges;

exports.ensureDataHasValidFields = (data, fields) => {
  const ensureDataHasValidField = field => {
    const fieldData = data[field];
    if (typeof fieldData !== "string") {
      throw new Error(errorMessages.nonString);
    }
    const fieldLength = fieldData.length;

    if (field === "tel") {
      if (fieldLength !== ranges.tel) {
        throw new Error(errorMessages.tel);
      }
      return;
    }
    if (!(fieldLength >= ranges[field][0] && fieldLength <= ranges[field][1])) {
      throw new Error(errorMessages[field]);
    }
  };

  for (const field of fields) {
    ensureDataHasValidField(field);
  }
};

exports.rejectIfFieldErroneous = (field, data) => {
  if (typeof field !== "string") {
    throw new Error(errorMessages.nonString);
  }
  const dataLength = data.length;
  if (field === "name") {
    if (!(dataLength >= ranges.name[0] && dataLength <= ranges.name[1])) {
      throw new Error(errorMessages.name);
    }
  }
  if (field === "email") {
    if (!(dataLength >= ranges.email[0] && dataLength <= ranges.email[1])) {
      throw new Error(errorMessages.name);
    }
  }
  if (field === "password") {
    if (
      !(dataLength >= ranges.password[0] && dataLength <= ranges.password[1])
    ) {
      throw new Error(errorMessages.name);
    }
  }
  if (field === "tel") {
    if (dataLength !== ranges.tel) {
      throw new Error(errorMessages.tel);
    }
  }
};
