const assert = require("assert");
const crypto = require("crypto");

const {
  verifyIDsAreEqual,
  verifyEqual,
  verifyTruthy,
  verifyNull,
} = require("../utils/testsUtils");

const {connectToDb, closeConnectionToBd} = require("../config");
const {createNewUser, clearTheDb} = require("../utils/generalUtils");

const {TokenGenerator} = require("../../database/models");

const VALIDITY_PERIOD_IN_MS = 1 * 60 * 60 * 1000;

const TRIALS = 10;
describe.skip("Token Generator", () => {
  let user;
  beforeAll(async () => {
    await connectToDb();
    user = await createNewUser();
  });

  afterAll(async () => {
    await closeConnectionToBd();
  });
  afterEach(async () => {
    await clearTheDb();
  });

  it("createOneForID creates a new distinct token which is for an id", async () => {
    const generatedTokens = [];
    for (let index = 0; index < TRIALS; index++) {
      const {
        requesterID,
        token,
        expiryTime,
      } = await TokenGenerator.createOneForID(user.id);
      generatedTokens.push(token);
      verifyIDsAreEqual(requesterID, user.id);
      verifyEqual(token.length, 64);
      ensureTokenIsNotExpired(expiryTime);
    }
    const genTokensLength = generatedTokens.length;
    generatedTokens.forEach((token, index) => {
      if (index < genTokensLength - 1) {
        assert.notEqual(token, generatedTokens[index + 1]);
      }
    });
  });
  describe("After Creation", () => {
    let tokens;
    describe(" Statics", () => {
      beforeEach(async () => {
        tokens = await createTokens(user.id, TRIALS);
      });
      test("findTokenDetails  returns tokenDetails and null if token is expired", async () => {
        for (const tokenDetails of tokens) {
          const {token} = tokenDetails;
          const {requesterID} = await TokenGenerator.findTokenDetails(token);
          verifyIDsAreEqual(requesterID, user.id);
          await makeTokenExpired(tokenDetails);
          const expectedTokenDetails = await TokenGenerator.findTokenDetails(
            token
          );
          verifyNull(expectedTokenDetails);
        }
      });

      it("findRequesterIDForToken  returns requesterIDForToken", async () => {
        for (const tokenDetails of tokens) {
          const requesterID = await TokenGenerator.findRequesterIDForToken(
            tokenDetails.token
          );
          verifyIDsAreEqual(requesterID, user.id);
        }
      });
    });
    describe("Instance", () => {
      let token;
      beforeEach(async () => {
        token = (await createTokens(user.id, 1))[0];
      });
      it("delete() delete current token", async () => {
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

const createTokens = async (requesterID, trials) => {
  let tokens = [];
  for (let index = 0; index < trials; index++) {
    let tokenDetails = new TokenGenerator({
      requesterID,
      token: crypto.randomBytes(32).toString("hex"),
      expiryTime: Date.now() + VALIDITY_PERIOD_IN_MS,
    });
    await tokenDetails.save();
    tokens.push(tokenDetails);
  }
  return tokens;
};
const ensureTokenIsNotExpired = expiryTime => {
  //give an allowance of 20 ms for the execution of the above code.
  verifyTruthy(expiryTime - VALIDITY_PERIOD_IN_MS <= Date.now() + 20);
};
