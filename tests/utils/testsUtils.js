exports.verifyEqual = (actual, expected) => {
  expect(actual).toEqual(expected);
};
exports.verifyTruthy = comparison => {
  expect(comparison).toBeTruthy();
};
exports.verifyFalsy = comparison => {
  expect(comparison).toBeFalsy();
};

exports.verifyIDsAreEqual = (actualId, expectedId) => {
  expect(actualId.toString()).toEqual(expectedId.toString());
};
exports.verifyThrowsError = (fn, message) => {
  expect(fn).toThrowError(message);
};

exports.verifyNull = object => {
  expect(object).toBeNull();
};
