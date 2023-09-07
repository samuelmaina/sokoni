const requires= require("../utils/requires");

const { TokenGenerator } = requires.Models;

const {
  verifyEqual,
  verifyIDsAreEqual,
} = require("../utils/testsUtils");
const { token } = requires.constrains;

const { TOKEN_VALIDITY_IN_HOURS } = requires.envs;
const {
  generateMongooseId,
  generateStringSizeN,
} = require("../utils/generalUtils/utils");
const { clearDb } = require("../utils/generalUtils/database");
const { includeSetUpAndTearDown, ValidationError } = require("./utils");

const validityTime = TOKEN_VALIDITY_IN_HOURS * 60 * 60 * 1000;

describe("--Token generator", () => {
  includeSetUpAndTearDown();
  afterEach(async () => {
    await clearDb();
  });
  describe("createForRequester", () => {
    it("generates a 64 long random string for  requester", async () => {
      const requester = generateMongooseId();
      const tokenDetails = await TokenGenerator.createOneForId(requester);
      verifyEqual(tokenDetails.token.length, 64);

      //ensure token is valid at time of creation.
      validateTokenDetails(tokenDetails, { requester });
    });
    it("should not create a new token for a requester, if the requester had requested a token earlier, The previous token is returned.", async () => {
      const requester = generateStringSizeN(token.requester.minlength);
      const tokenOne = await TokenGenerator.createOneForId(requester);
      const tokenTwo = await TokenGenerator.createOneForId(requester);
      //Each doc in mongoose has a special id. The ids can be used to
      //verify that actually it the same docuemnt that is being returned.
      verifyIDsAreEqual(tokenOne._id, tokenTwo._id);
      verifyEqual(await TokenGenerator.countDocuments(), 1);
    });
    describe("rejects if requester length is out of range", () => {
      it("too short", async () => {
        const requesterId = generateStringSizeN(token.requester.minlength - 1);
        await expect(
          TokenGenerator.createOneForId(requesterId)
        ).rejects.toThrowError(ValidationError);
      });
      it("too long", async () => {
        const requesterId = generateStringSizeN(token.requester.maxlength + 1);
        await expect(
          TokenGenerator.createOneForId(requesterId)
        ).rejects.toThrowError(ValidationError);
      });
    });
  });
  describe("findTokenDetailsByToken", () => {
    let tokenDetails;
    beforeEach(async () => {
      const requesterId = generateMongooseId();
      tokenDetails = await createNewTokenDetailsForId(requesterId);
    });
    afterEach(async () => {
      await clearDb();
    });
    it("should return tokenDetails for valid token", async () => {
      const received = await TokenGenerator.findTokenDetailsByToken(
        tokenDetails.token
      );
      validateTokenDetails(received, tokenDetails);
    });
    it("should return null incase the token is expired.", async () => {
      const token = tokenDetails.token;
      await makeTokenExpired(tokenDetails);
      await expect(
        TokenGenerator.findTokenDetailsByToken(token)
      ).resolves.toBeNull();
    });
    it("should return null if token is not present", async () => {
      const token = generateStringSizeN(64);
      await expect(
        TokenGenerator.findTokenDetailsByToken(token)
      ).resolves.toBeNull();
    });
  });
  it("delete", async () => {
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
  verifyIDsAreEqual(actual.requester, expected.requester);
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
