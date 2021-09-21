const { intValidator } = require("./utils");

exports.shortCodeV = intValidator({
  field: "shortCode",
  min: 100000,
  max: 999999,
  err: "Short Code must be of 6 numbers.",
});
