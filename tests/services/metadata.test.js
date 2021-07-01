const { addElementIfNonExisting } = require('../../database/services/metadata');
const { ensureArrayContains, verifyEqual } = require('../utils/testsUtils');

describe.skip('should be able to add element to arr', () => {
	it('when there are no preexisting element', () => {
		const firstElement = {
			category: 'category 1',
			adminId: 'qe98r9re0r9e9re',
		};
		const arr = [];
		addElementIfNonExisting(arr, firstElement);
		const stored = arr[0];
		verifyEqual(firstElement.category, stored.category);
		ensureArrayContains(stored.adminIds, firstElement.adminId);
	});
	it('should not add element if the elem already exists in the array but only add the admin Id ', () => {
		const testCategory = 'category 1';
		const category1 = {
			category: testCategory,
			adminId: 'qe98r9re0r9e9re',
		};
		const category1DifferentAdmin = {
			category: testCategory,
			adminId: 'qljfkldjlfjdl',
		};
		const arr = [];
		addElementIfNonExisting(arr, category1);
		addElementIfNonExisting(arr, category1DifferentAdmin);
		verifyEqual(arr.length, 1);
		const stored = arr[0];
		verifyEqual(stored.category, testCategory);
		const adminIds = stored.adminIds;
		ensureArrayContains(adminIds, category1.adminId);
		ensureArrayContains(adminIds, category1DifferentAdmin.adminId);
	});
});
