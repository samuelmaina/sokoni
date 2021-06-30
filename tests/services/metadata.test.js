const { addElementIfNonExisting } = require('../../database/services/metadata');
const { ensureArrayContains, verifyEqual } = require('../utils/testsUtils');

describe('should be able to add element to arr', () => {
	it('when there are no preexisting element', () => {
		const firstElement = 'element 1';
		const arr = [];
		addElementIfNonExisting(arr, firstElement);
		ensureArrayContains(arr, firstElement);
	});
	it('should not add element if the elem already exists in the array', () => {
		const firstElement = 'element 1';
		const arr = [firstElement];
		addElementIfNonExisting(arr, firstElement);
		verifyEqual(arr.length, 1);
		ensureArrayContains(arr, firstElement);
	});
});
