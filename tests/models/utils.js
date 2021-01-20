const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const {connectToDb, closeConnectionToBd} = require("../config");

const {generateStringSizeN} = require("../utils/generalUtils");

const ranges = require("../../config/constraints");
const {create} = require("../../database/models/user");

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
exports.hashPassword = async plain => {
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

exports.validateStringField = async testData => {
  const func = testData.func;
  const field = testData.field;
  const minlength = testData.minlength;
  const maxlength = testData.maxLength;
  const otherFields = testData.otherFields;
  const err = testData.err;
  it(`reject ${field} non-string`, async () => {
    await ensureThrows([1, 2]);
  });
  describe(`reject ${field} < ${minlength} and  > ${maxlength} long.`, () => {
    it(`< ${minlength}`, async () => {
      await ensureThrows(generateStringSizeN(minlength - 1));
    });
    it(`> ${maxlength}`, async () => {
      await ensureThrows(generateStringSizeN(maxlength + 1));
    });
  });
  it(`does not throw on valid ${field}`, async () => {
    await ensureDoesNotThrow(generateStringSizeN(minlength));
    await ensureDoesNotThrow(generateStringSizeN(maxlength));
  });
  const ensureThrows = async data => {
    //if there are no  other otherfields, then the function
    //takes does not take objects with many  params
    if (!otherFields) {
      return await expect(func(data)).rejects.toThrow(err);
    }
    //else we need to append the other fields into the param object
    let input = createArguementObject(field, data, otherFields);
    await expect(func(input)).rejects.toThrow(err);
  };
  const ensureDoesNotThrow = async data => {
    if (!otherFields) {
      return await expect(func(data)).resolves.not.toThrow();
    }
    let input = createArguementObject(field, data, otherFields);
    await expect(func(input)).resolves.not.toThrow();
  };
};

exports.validateFloatField = async testData => {
  const func = testData.func;
  const field = testData.field;
  const lowerlimit = testData.lowerlimit;
  const upperlimit = testData.upperlimit;
  const otherFields = testData.otherFields;
  const err = testData.err;
  it(`reject ${field} non-numeric`, async () => {
    await ensureThrows("text");
  });
  describe(`reject ${field} < ${lowerlimit} and  > ${upperlimit} long.`, () => {
    it(`< ${lowerlimit}`, async () => {
      await ensureThrows(lowerlimit - 1);
    });
    it(`> ${upperlimit}`, async () => {
      await ensureThrows(upperlimit + 1);
    });
  });
  it(`does not throw on valid ${field}`, async () => {
    await ensureDoesNotThrow(lowerlimit);
    await ensureDoesNotThrow(upperlimit);
  });

  const ensureThrows = async data => {
    //if there are no  other otherfields, then the function
    //takes does not take objects with many  params
    if (!otherFields) {
      return await expect(func(data)).rejects.toThrow(err);
    }
    //else we need to append the other fields into the param object
    let input = createArguementObject(field, data, otherFields);
    await expect(func(input)).rejects.toThrow(err);
  };
  const ensureDoesNotThrow = async data => {
    if (!otherFields) {
      return await expect(func(data)).resolves.not.toThrow();
    }
    let input = createArguementObject(field, data, otherFields);
    await expect(func(input)).resolves.not.toThrow();
  };
};
exports.validateIntField = async testData => {
  it("should reject float values", async () => {
    const func = testData.func;
    const field = testData.field;
    const lowerlimit = testData.lowerlimit;
    const otherFields = testData.otherFields;
    const err = testData.err;

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

const createArguementObject = (field, data, otherFields) => {
  const arg = {};
  arg[field] = data;
  return this.mergeBintoA(arg, otherFields);
};
exports.ensureObjectsHaveSameFields = function (A, B, fields) {
  for (const field of fields) {
    expect(A[field]).toBe(B[field]);
  }
};
