const { strictEqual } = require("assert");

const requires = require("../utils/requires");

const { validationResults } = requires.utils;

const { verifyEqual, verifyTruthy } = require("../utils/testsUtils");

const { generateStringSizeN } = require("../utils/generalUtils/utils");

exports.validateStringField = (validator, field, min, max, err) => {
  it(field + " throws for too small", async () => {
    const string = generateStringSizeN(min - 1);
    await generatesErrorWith(validator, field, string, err);
  });
  it(field + " throws for too large", async () => {
    const string = generateStringSizeN(max + 1);
    await generatesErrorWith(validator, field, string, err);
  });
};

exports.validateFloatField = function (validator, field, min, max, err) {
  it(field + "throws for too small", async () => {
    await generatesErrorWith(validator, field, min - 1, err);
  });
  it(field + "throws for too large", async () => {
    await generatesErrorWith(validator, field, max + 1, err);
  });
};
exports.validateIntegerField = (validator, field, min, max, err) => {
  it(field + "throws for non floats ", async () => {
    await generatesErrorWith(
      validator,
      field,
      min + 0.25,
      field + " must be a whole number."
    );
  });
  this.validateFloatField(validator, field, min, max, err);
};

async function generatesErrorWith(validator, field, data, errorMessage) {
  const body = {};
  body[field] = data;
  await ensureGeneratesErrorOnPart(body, validator, errorMessage);
}

async function ensureGeneratesErrorOnPart(part, validator, error) {
  verifyEqual(await validate(part, validator), error);
}

async function ensureDoesNotGeneratesErrorOnPart(body, validator) {
  expect(await validate(body, validator)).toBeUndefined();
}

exports.validateMiddlewares = async function (body, validators) {
  expect(await validateMany(body, validators)).not.toBeUndefined();
};

const validateMany = async (body, validators) => {
  const req = mockReq(body);
  const res = mockRes();
  await applyValidationToMany(req, res, validators);
  return validationResults(req);
};
const validate = async (body, validator) => {
  const req = mockReq(body);
  const res = mockRes();
  await applyValidation(req, res, validator);
  return validationResults(req);
};

const mockReq = (bodyData) => {
  return {
    body: bodyData,
  };
};
const mockRes = () => {
  return {};
};

const applyValidationToMany = async (req, res, validators) => {
  await Promise.all(
    validators.map(async (validator) => {
      await validator(req, res, () => undefined);
    })
  );
};
const applyValidation = async (req, res, validator) => {
  await validator(req, res, () => undefined);
};

exports.ensureGeneratesErrorOnPart = ensureGeneratesErrorOnPart;
exports.ensureDoesNotGeneratesErrorOnPart = ensureDoesNotGeneratesErrorOnPart;
