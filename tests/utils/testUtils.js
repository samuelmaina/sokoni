exports.verifyDeeplyEqual = (actual, expected) => {
  expect(actual).toEqual(expected);
};
exports.verifyTruthy = (comparison) => {
  expect(comparison).toBeTruthy();
};
exports.verifyFalsy = (comparison) => {
  expect(comparison).toBeFalsy();
};

exports.verifyIDs = (actualId, expectedId) => {
  expect(actualId.toString()).toEqual(expectedId.toString());
};
