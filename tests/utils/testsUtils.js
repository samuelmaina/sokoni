exports.verifyEqual = (actual, expected) => {
	expect(actual).toEqual(expected);
};
exports.ensureCloselyEqual = (actual, expected, delta) => {
	expect(actual).toBeCloseTo(expected, delta);
};
exports.ensureArrayContains = (arr, element) => {
	expect(arr).toContain(element);
};

//had to do this because mongoose arrays can not be vefied by the .toEqual matcher.
exports.ensureMongooseArraysAreEqual = (expected, actual) => {
	this.verifyEqual(actual.length, expected.length);

	for (const elem of expected) {
		this.ensureArrayContains(actual, elem);
	}
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
exports.ensureObjectHasKeyValuePair = (object, key, value) => {
	expect(object).toHaveProperty(key, value);
};

exports.verifyNull = object => {
	expect(object).toBeNull();
};

exports.verifyUndefined = value => {
	expect(value).toBeUndefined();
};

exports.verifyThrowsError = (func, err) => {
	expect(func).toThrowError();
};

exports.verifyDoesNotThrowError = func => {
	expect(func).not.toThrowError();
};

exports.verifyRejectsWithError = async (func, err) => {
	await expect(func).rejects.toThrowError(err);
};
exports.verifyResolvesWithNull = func => {
	expect(func).resolves.toBeNull();
};
exports.verifyResolvesWithData = async (func, data) => {
	await expect(func).resolves.toBe(data);
};
