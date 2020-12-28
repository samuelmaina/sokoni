const ObjectId = require("mongoose").Types.ObjectId;

exports.ensureIsMongooseId = id => {
  // const isId = ObjectId.isValid(id);
  // if (!isId) {
  //   throw new Error("The id is not a valid id.");
  // }
  // const castId = new ObjectId(id);
  // const isValidMongooseId = castId === id;
  // if (!isValidMongooseId) {
  //   throw new Error("The id passed is not a mongoose id.");
  // }
};
exports.ensureIsPositiveInt = value => {
  if (!(Number.isInteger(value) && value > 0))
    throw new Error("Value passed is not a positive integer.");
};
exports.ensureIsPositiveFloat = value => {
  if (value === null) {
    throw new Error("The value passed is null");
  }
  //integers are also floats,so we don't have
  //a special check for them.
  const isFloat = typeof value === "number";
  if (!(isFloat && value > 0))
    throw new Error("Value passed is not a positive float.");
};
exports.ensureStringIsLength = (string, length) => {
  const isString = typeof string === "string";
  const lengthIsNumericAndNonNegative =
    typeof length === "number" && length > 0;

  if (!lengthIsNumericAndNonNegative) {
    throw new Error("Length is either non-numeric or negative");
  }
  if (!isString) {
    throw new Error("Value passed is not a string");
  }

  if (string.length !== length)
    throw new Error(`String is not length ${length}`);
};

exports.ensureIsObject = value => {
  const type = typeof value;

  //arrays in js are treated as objects.
  //We need to eliminate them so
  //that we don't get false positives.
  const isArray = Array.isArray(value);

  if (isArray || value === null || type !== "object")
    throw new Error("Value passed is not an object ");
  if (value.length < 1) throw new Error("Passed an empty object ");
};
