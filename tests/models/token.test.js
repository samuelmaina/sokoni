const { TokenGenerator } = require('../../database/models');

const {
	verifyEqual,
	verifyNull,
	verifyIDsAreEqual,
} = require('../utils/testsUtils');
const { mongooseId, tokenGen } = require('../../config/constraints');

const { TOKEN_VALIDITY_IN_HOURS } = require('../../config/env');
const {
	generateMongooseId,
	generateStringSizeN,
} = require('../utils/generalUtils/utils');
const { clearDb } = require('../utils/generalUtils/database');
const { includeSetUpAndTearDown, ValidationError } = require('./utils');

const validityTime = TOKEN_VALIDITY_IN_HOURS * 60 * 60 * 1000;

describe.skip('--Token generator', () => {
	includeSetUpAndTearDown();
	afterEach(async () => {
		await clearDb();
	});
	describe('createOneForId', () => {
		it('generates a 64 long random string for requester Id', async () => {
			const requesterId = generateMongooseId();
			const tokenDetails = await TokenGenerator.createOneForId(requesterId);
			verifyEqual(tokenDetails.token.length, 64);

			//ensure token is valid at time of creation.
			validateTokenDetails(tokenDetails, { requesterId });
		});
		it('rejects if requesterId  is not a mongoose Id', async () => {
			const requesterId = generateStringSizeN(mongooseId.exact);
			await expect(
				TokenGenerator.createOneForId(requesterId)
			).rejects.toThrowError(ValidationError);
		});
	});
	describe('findTokenDetailsByToken', () => {
		let tokenDetails;
		beforeEach(async () => {
			const requesterId = generateMongooseId();
			tokenDetails = await createNewTokenDetailsForId(requesterId);
		});
		afterEach(async () => {
			await clearDb();
		});
		it('should return tokenDetails for valid token', async () => {
			const received = await TokenGenerator.findTokenDetailsByToken(
				tokenDetails.token
			);
			validateTokenDetails(received, tokenDetails);
		});
		it('should return null incase the token is expired.', async () => {
			const token = tokenDetails.token;
			await makeTokenExpired(tokenDetails);
			await expect(
				TokenGenerator.findTokenDetailsByToken(token)
			).resolves.toBeNull();
		});
		it('should return null if token is not present', async () => {
			const token = generateStringSizeN(64);
			await expect(
				TokenGenerator.findTokenDetailsByToken(token)
			).resolves.toBeNull();
		});
	});
	it('delete', async () => {
		const requesterId = generateMongooseId();
		const tokenDetails = await createNewTokenDetailsForId(requesterId);
		const id = tokenDetails.id;
		await tokenDetails.delete();
		await expect(TokenGenerator.findById(id)).resolves.toBeNull();
	});
});

async function makeTokenExpired(tokenDetails) {
	//make it late by 1 second.
	tokenDetails.expiryTime -= validityTime + 1000;
	await tokenDetails.save();
}

function validateTokenDetails(actual, expected) {
	verifyIDsAreEqual(actual.requesterId, expected.requesterId);
	ensureTokenNotExpired(actual.expiryTime);
}
async function createNewTokenDetailsForId(id) {
	return await TokenGenerator.createOneForId(id);
}
function ensureTokenNotExpired(expiryTime) {
	expect(Date.parse(expiryTime)).toBeGreaterThan(
		//the db does not include elapsed milliseconds,it returns
		//only the seconds elapsed.
		(Date.now() + validityTime) % 1000
	);
}
