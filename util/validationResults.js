const {validationResult} = require("express-validator");
/**
 * Pulls all validation errors from a stream
 * @param {object} pathValidatedEarlier - the path that was validated earlier
 * @returns all the  the validation errors that were found at path earlier validated
 */
module.exports = pathValidatedEarlier => {
  const errors = validationResult(pathValidatedEarlier);
  if (!errors.isEmpty()) {
    return errors.array()[0].msg;
  }
};
