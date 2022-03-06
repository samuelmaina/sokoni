const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { connectToDb, closeConnectionToBd } = require("../config");

const { generateStringSizeN } = require("../utils/generalUtils/utils");



const requires= require('../utils/requires');

const ranges = requires.constrains;
const SALT_ROUNDS = 12;

exports.ranges = ranges;

exports.ValidationError = mongoose.Error.ValidationError;

exports.includeSetUpAndTearDown = () => {
  beforeAll(async () => {
    await connectToDb();
  });
  afterAll(async () => {
    await closeConnectionToBd();
  });
};
exports.hashPassword = async (plain) => {
  return bcrypt.hash(plain, SALT_ROUNDS);
};
exports.confirmPassword = async (plain, hash) => {
  return bcrypt.compare(plain, hash);
};
exports.mergeBintoA = function (A, B) {
  for (const field in B) {
    if (B.hasOwnProperty(field)) {
      A[field] = B[field];
    }
  }
  return A;
};

exports.validateStringField = function (testData) {
  const { func, field, minlength, maxlength, otherFields, err } = testData;
  it(`reject ${field} non-string`, async () => {
    await runErrorTest([1, 2]);
  });
  describe(`reject ${field} < ${minlength} and  > ${maxlength} long.`, () => {
    it(`< ${minlength}`, async () => {
      await runErrorTest(generateStringSizeN(minlength - 1));
    });
    it(`> ${maxlength}`, async () => {
      await runErrorTest(generateStringSizeN(maxlength + 1));
    });
  });
  it(`does not throw on valid ${field}`, async () => {
    await runSuccesstTest(generateStringSizeN(minlength));
    await runSuccesstTest(generateStringSizeN(maxlength));
  });
  async function runErrorTest(data) {
    await ensureThrows(field, func, data, otherFields, err);
  }
  async function runSuccesstTest(data) {
    await ensureDoesNotThrow(field, func, data, otherFields);
  }
};

exports.validateFloatField = async (testData) => {
  const { func, field, lowerlimit, upperlimit, otherFields, err } = testData;
  it(`reject ${field} non-numeric`, async () => {
    await runErrorTest("text");
  });
  describe(`reject ${field} < ${lowerlimit} and  > ${upperlimit} long.`, () => {
    it(`< ${lowerlimit}`, async () => {
      await runErrorTest(lowerlimit - 1);
    });
    it(`> ${upperlimit}`, async () => {
      await runErrorTest(upperlimit + 1);
    });
  });
  it(`does not throw on valid ${field}`, async () => {
    await runSuccesstTest(lowerlimit);
    await runSuccesstTest(upperlimit);
  });
  async function runErrorTest(data) {
    await ensureThrows(field, func, data, otherFields, err);
  }
  async function runSuccesstTest(data) {
    await ensureDoesNotThrow(field, func, data, otherFields);
  }
};

exports.validateIntField = async (testData) => {
  it("should reject float values", async () => {
    const { func, field, lowerlimit, otherFields, err } = testData;

    const data = lowerlimit + 0.1;
    if (!otherFields) {
      return await expect(func(data)).rejects.toThrow(err);
    }
    let input = createArguementObject(field, data, otherFields);

    await expect(func(input)).rejects.toThrow(err);
  });
  //int are floats, as such they should pass all the float test.
  this.validateFloatField(testData);
};

exports.ensureObjectsHaveSameFields = function (A, B, fields = []) {
  for (const field of fields) {
    expect(A[field]).toBe(B[field]);
  }
};
exports.productProps = [
  "title",
  "imageUrl",
  "buyingPrice",
  "percentageProfit",
  "quantity",
  "brand",
  "category",
  "description",
];

const createArguementObject = (field, data, otherFields) => {
  const arg = {};
  arg[field] = data;
  return this.mergeBintoA(arg, otherFields);
};
async function ensureThrows(field, func, data, otherFields, err) {
  //if there are no  other otherfields, then the function
  //does takes one argument.
  if (!otherFields) {
    return await expect(func(data)).rejects.toThrow(err);
  }
  //else we need to append the other fields into the param object
  let input = createArguementObject(field, data, otherFields);
  await expect(func(input)).rejects.toThrow(err);
}
async function ensureDoesNotThrow(field, func, data, otherFields) {
  if (!otherFields) {
    return await expect(func(data)).resolves.not.toThrow();
  }
  let input = createArguementObject(field, data, otherFields);
  await expect(func(input)).resolves.not.toThrow();
}
