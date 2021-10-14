const assert = require("assert");
const mongoose = require("mongoose");
const { mongooseId } = require("../../config/constraints");

const ObjectId = mongoose.Types.ObjectId;

exports.throwErrorIfStringLengthNotInRange = function (
  string,
  minlength,
  maxLength,
  error
) {
  if (typeof string !== "string") {
    throw new Error(error);
  }
  const stringLength = string.length;
  if (!(stringLength >= minlength && stringLength <= maxLength)) {
    throw new Error(error);
  }
};

exports.connector = async (mongo_uri) => {
  try {
    const connection = await mongoose.connect(mongo_uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    assert.ok(connection, "No errors thrown but connection not established.");
  } catch (error) {
    throw new Error(error);
  }
};

exports.ensureIsMongooseId = (id) => {
  const isId = ObjectId.isValid(id);
  const errorMessage = mongooseId.error;

  if (!isId) {
    throw new Error(errorMessage);
  }
  /**
   * introducing some buggy behaviour
   * .A valid Id that is passed as
   * a string is rejected ,
   * Numbers are interpreted as
   * valid ids,
   * but  will solve it later.
   */
  //   const castId = new ObjectId(id);
  //   const isValidMongooseId = castId === id;
  //   if (!isValidMongooseId) {
  //     throw new Error(errorMessage);
  //   }
};

exports.ensureStringIsNonEmpty = (string) => {
  if (!(typeof string === "string" && string.length > 0)) {
    throw new Error("Value must be a non empty string.");
  }
};
exports.ensureIsInt = (value, err) => {
  if (!Number.isInteger(value)) throw new Error(err);
};
exports.ensureIsPositiveInt = (value, err) => {
  this.ensureIsInt(value, err);
  if (value < 1) throw new Error(err);
};

exports.ensureIsPositiveFloat = (value, err) => {
  if (value === null) {
    throw new Error(err);
  }
  //integers are also floats,so we don't have
  //a special check for them.
  const isFloat = typeof value === "number";
  if (!(isFloat && value > 0)) throw new Error(err);
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

exports.ensureIsNonEmptyObject = (object) => {
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

exports.ensureValueIsWithinRange = (value, lowerlimit, upperlimit, err) => {
  if (!(value >= lowerlimit && value <= upperlimit)) {
    throw new Error(err);
  }
};
