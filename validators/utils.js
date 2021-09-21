const { check } = require("express-validator");

exports.stringValidator = (data) => {
  ensureAllPropsAreThere(data);
  const { field, min, max, err } = data;
  return check(field)
    .isString()
    .withMessage(`${field} must be a string.`)
    .isLength({ min: min, max })
    .withMessage(err);
};

exports.floatValidator = (data) => {
  ensureAllPropsAreThere(data);
  const { field, min, max, err } = data;
  return check(field)
    .isFloat()
    .withMessage(`${field} must be a number.`)
    .custom((value) => {
      if (!(value >= min && value <= max)) {
        throw new Error(err);
      }
      return true;
    });
};

exports.intValidator = (data) => {
  ensureAllPropsAreThere(data);
  const { field, min, max, err } = data;
  return check(field)
    .isInt()
    .withMessage(`${field} must be a whole number.`)
    .custom((value) => {
      if (!(value >= min && value <= max)) {
        throw new Error(err);
      }
      return true;
    });
};

exports.mongoIdValidator = (field, err) => {
  return check(field).isMongoId().withMessage(err);
};

function ensureAllPropsAreThere(data) {
  const props = ["field", "min", "max", "err"];
  ensureObjectHasProps(data, props);
}
function ensureObjectHasProps(obj, props) {
  for (const prop of props) {
    if (!obj.hasOwnProperty(prop)) throw new Error(`${prop} is required.`);
  }
}
