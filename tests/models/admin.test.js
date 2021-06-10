const { Admin } = require('../../database/models');
const { includeSetUpAndTearDown } = require('./utils');

const baseTest = require('./baseAdminAndUser');
describe('---Admin', () => {
	includeSetUpAndTearDown();
	baseTest(Admin);
});
