const {validationResults} = require("../../../utils");

exports.ensureGeneratesErrorOnBody = async (body, validator, error) => {
  expect(await validate(body, validator)).toBe(error);
};

exports.ensureDoesNotGenerateErrorOnBody = async (body, validator) => {
  expect(await validate(body, validator)).toBeUndefined();
};
const validate = async (body, validator) => {
  const req = mockReq(body);
  const res = mockRes();
  await applyValidation(req, res, validator);
  return validationResults(req);
};

const mockReq = bodyData => {
  return {
    body: bodyData,
  };
};
const mockRes = () => {
  return {};
};

const applyValidation = async (req, res, middleware) => {
  await middleware(req, res, () => undefined);
};
