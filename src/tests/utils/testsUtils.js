exports.verifyEqual = (actual, expected) => {
	expect(actual).toEqual(expected);
};

exports.ensureLessThanOrEqual = (less, greater) => {
	expect(less).toBeLessThanOrEqual(greater);
};

exports.ensureGreaterThanOrEqual = (greater, less) => {
	expect(greater).toBeGreaterThanOrEqual(less);
};
exports.ensureCloselyEqual = (actual, expected, delta) => {
	expect(actual).toBeCloseTo(expected, delta);
};
exports.ensureArrayContains = (arr, element) => {
	expect(arr).toContain(element);
};
exports.ensureArrayConstainsKeyValuePair = (arr, key, value) => {
	expect(arr).toHaveProperty(key, value);
};

exports.ensureValueGreateThan = (greater, less) => {
	expect(greater).toBeGreaterThan(less);
};

exports.ensureValueLessThan = (less, greater) => {
	expect(less).toBeLessThan(greater);
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
exports.ensureObjectHasProps = (object, props) => {
	for (const prop of props) {
		expect(object).toHaveProperty(prop);
	}
};

exports.verifyNull = object => {
	expect(object).toBeNull();
};

exports.verifyUndefined = value => {
	expect(value).toBeUndefined();
};

exports.verifyThrowsError = (func, err) => {
	expect(func).toThrowError(err);
};

exports.verifyDoesNotThrowError = func => {
	expect(func).not.toThrowError();
};

exports.ensureResolvesToNull = async func => {
	await expect(func).resolves.toBeNull();
};

exports.verifyRejectsWithError = async (func, err) => {
	await expect(func).rejects.toThrowError(err);
};

exports.verifyResolvesWithData = async (func, data) => {
	await expect(func).resolves.toBe(data);
};
