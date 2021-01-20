exports.verifyEqual = (actual, expected) => {
  expect(actual).toEqual(expected);
};
exports.verifyTruthy = predicate => {
  expect(predicate).toBeTruthy();
};
exports.verifyFalsy = predicate => {
  expect(predicate).toBeFalsy();
};

exports.verifyIDsAreEqual = (actualId, expectedId) => {
  expect(actualId.toString()).toEqual(expectedId.toString());
};

exports.verifyNull = object => {
  expect(object).toBeNull();
};

exports.verifyUndefined = value => {
  expect(value).toBeUndefined();
};

exports.verifyThrowsError = (func, err) => {
  expect(func).toThrow(err);
};
exports.verifyDoesNotThrowError = func => {
  expect(func).not.toThrow();
};

exports.verifyRejectsWithError = async (func, err) => {
  await expect(func).rejects.toThrow(err);
};
exports.verifyResolvesWithNull = func => {
  expect(func).resolves.toBeNull();
};
exports.verifyResolvesWithData = async (func, data) => {
  await expect(func).resolves.toBe(data);
};
