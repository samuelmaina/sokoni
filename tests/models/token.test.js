const crypto = require("crypto");

const {TokenGenerator} = require("../../database/models");

const {
  verifyIDsAreEqual,
  verifyEqual,
  verifyTruthy,
  verifyNull,
} = require("../utils/testsUtils");

const {includeSetUpAndTearDown} = require("./utils");
const {
  generateMongooseId,
  clearDataFromModel,
} = require("../utils/generalUtils");

const VALIDITY_PERIOD_IN_MS = 1 * 60 * 60 * 1000;

const sampleRequesterId = generateMongooseId();

const TRIALS = 50;
describe.skip("Token Generator", () => {
  includeSetUpAndTearDown();
  afterEach(async () => {
    await clearDataFromModel(TokenGenerator);
  });
  describe("Creation", () => {
    it("createOneForId creates a new distinct token for an id", async () => {
      const tokenDetails = await TokenGenerator.createOneForId(
        sampleRequesterId
      );
      const {requesterId, token, expiryTime} = tokenDetails;
      verifyIDsAreEqual(requesterId, sampleRequesterId);
      verifyEqual(token.length, 64);
      ensureTokenIsNotExpired(expiryTime);
    });
  });
  describe("After Creation", () => {
    let tokens;
    describe("Static Methods", () => {
      beforeEach(async () => {
        tokens = await createTokens(sampleRequesterId, TRIALS);
      });
      test("findTokenDetails  returns tokenDetails and null if token is expired", async () => {
        for (const tokenDetails of tokens) {
          const {token} = tokenDetails;
          const {
            requesterId,
            expiryTime,
          } = await TokenGenerator.findTokenDetails(token);
          ensureTokenIsNotExpired(expiryTime);
          verifyIDsAreEqual(sampleRequesterId, requesterId);
          await makeTokenExpired(tokenDetails);
          const expectedTokenDetails = await TokenGenerator.findTokenDetails(
            token
          );
          verifyNull(expectedTokenDetails);
        }
      });
    });
    describe("Instance methods", () => {
      let token;
      beforeEach(async () => {
        token = (await createTokens(sampleRequesterId, 1))[0];
      });
      it("delete() deletes current token", async () => {
        const tokenId = token.id;
        await token.delete();
        const receivedTokenDetails = await TokenGenerator.findById(tokenId);
        verifyNull(receivedTokenDetails);
      });
    });
  });
});
const makeTokenExpired = async tokenDetails => {
  tokenDetails.expiryTime = Date.now() - VALIDITY_PERIOD_IN_MS;
  await tokenDetails.save();
};

const createTokens = async (requesterId, trials) => {
  let tokens = [];
  for (let index = 0; index < trials; index++) {
    let tokenDetails = new TokenGenerator({
      requesterId,
      token: crypto.randomBytes(32).toString("hex"),
      expiryTime: Date.now() + VALIDITY_PERIOD_IN_MS,
    });
    await tokenDetails.save();
    tokens.push(tokenDetails);
  }
  return tokens;
};
const ensureTokenIsNotExpired = expiryTime => {
  //give an allowance of 20 ms for the execution of code.
  verifyTruthy(expiryTime - VALIDITY_PERIOD_IN_MS <= Date.now() + 20);
};
