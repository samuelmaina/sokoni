const {
  verifyIDsAreEqual,
  verifyEqual,
  verifyTruthy,
  verifyNull,
} = require("../utils/testUtils");

const {connectToDb, closeConnectionToBd} = require("../config");
const {createNewUser, clearTheDb} = require("../utils/generalUtils");

const {TokenGenerator} = require("../../database/models");

const VALIDITY_PERIOS_IN_MS = 1 * 60 * 60 * 1000;
describe("Token Generator", () => {
  beforeAll(async () => {
    await connectToDb();
  });
  afterAll(async () => {
    await closeConnectionToBd();
  });
  afterEach(async () => {
    await clearTheDb();
  });

  let user;

  it("createNeWForId creates a new token which is for an id", async () => {
    const user = await createNewUser();
    const {
      requesterId,
      token,
      expiryTime,
    } = await TokenGenerator.createNewForId(user.id);
    verifyIDsAreEqual(requesterId, user.id);
    verifyEqual(token.length, 64);
    ensureTokenIsNotExpired(expiryTime);
  });
  describe("After Creation", () => {
    let tokenDetails;
    let user;
    describe(" Statics", () => {
      beforeEach(async () => {
        user = await createNewUser();
        tokenDetails = await createToken(user.id);
      });
      afterEach(async () => {
        await clearTheDb();
        tokenDetails = null;
      });

      it("findTokenDetails  returns tokenDetails and null if token is expired", async () => {
        const {requesterId, token} = await TokenGenerator.findTokenDetails(
          tokenDetails.token
        );
        verifyIDsAreEqual(requesterId, user.id);
        await makeTokenExpired();
        const expectedTokenDetails = await TokenGenerator.findTokenDetails(
          tokenDetails.token
        );
        verifyNull(expectedTokenDetails);
      });

      it("deleteTokenById  delete tokenDetails with the given Id", async () => {
        const tokenId = tokenDetails.id;
        await TokenGenerator.deleteTokenById(tokenId);
        const receivedTokenDetails = await TokenGenerator.findById(
          tokenDetails.id
        );
        verifyNull(receivedTokenDetails);
      });
    });

    const makeTokenExpired = async () => {
      tokenDetails.expiryTime = Date.now() - VALIDITY_PERIOS_IN_MS;
      await tokenDetails.save();
    };
  });
});

const createToken = async id => {
  let tokenDetails = new TokenGenerator({
    requesterId: id,
  });
  await tokenDetails.save();
  return tokenDetails;
};
const ensureTokenIsNotExpired = expiryTime => {
  //give an allowance of 20 ms for the execution of the above code.
  verifyTruthy(expiryTime - VALIDITY_PERIOS_IN_MS <= Date.now() + 20);
};
