const ObjectId = require("mongoose").Types.ObjectId;

exports.ensureIsMongooseId = id => {
  const isId = ObjectId.isValid(id);
  const errorMessage = "Invalid mongoose Id.";

  if (!isId) {
    throw new Error(errorMessage);
  }
  /**
   * introducing some buggy behaviour
   * .A valid Id that is passed as
   * a string is rejected ,
   * Numbers are interpreted as
   * valid ids,
   * but I will solve it later.
   */
  //   const castId = new ObjectId(id);
  //   const isValidMongooseId = castId === id;
  //   if (!isValidMongooseId) {
  //     throw new Error(errorMessage);
  //   }
};
exports.ensureIsPositiveInt = value => {
  if (!(Number.isInteger(value) && value > 0))
    throw new Error("Value must be positive integer.");
};
exports.ensureIsPositiveFloat = value => {
  const errorMessage = "Value must be positive float.";

  if (value === null) {
    throw new Error(errorMessage);
  }
  //integers are also floats,so we don't have
  //a special check for them.
  const isFloat = typeof value === "number";
  if (!(isFloat && value > 0)) throw new Error(errorMessage);
};
exports.ensureStringIsLength = (string, length) => {
  const errorMessage = `String must be of length ${length}.`;
  if (!(Number.isInteger(length) && length >= 0)) {
    throw new Error("Invalid length.");
  }
  const isString = typeof string === "string";
  if (!isString) {
    throw new Error(errorMessage);
  }
  if (string.length !== length) throw new Error(errorMessage);
};

exports.ensureIsNonEmptyObject = object => {
  const errorMessage = "Invalid Object.";
  const type = typeof object;

  //arrays will have type object.
  //Function should not treat array
  //as objects.
  const isArray = Array.isArray(object);

  if (isArray || object === null || type !== "object")
    throw new Error(errorMessage);
  if (Object.values(object).length < 1) throw new Error(errorMessage);
};
