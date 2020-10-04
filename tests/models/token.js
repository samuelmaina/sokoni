const { connectToDb, closeConnectionToBd } = require("../config");
const {
  createNewAdmin,
  deleteAdmin,
  createTestProducts,
  createNewUser,
  deleteUser,
} = require("../utils");

const { TokenGenerator } = require("../../database/models");

const VALIDITY_PERIOS_IN_MS = 1 * 60 * 60 * 1000;

const createToken = async (id) => {
  let tokenDetails = new TokenGenerator({
    requesterId: id,
  });
  await tokenDetails.save();
  return tokenDetails;
};

describe("Token Generator", () => {
  beforeEach(async () => {
    await connectToDb();
  });
  afterEach(async () => {
    await closeConnectionToBd();
  });
  let user;

  it("createNeWForId creates a new token which is for an id", async () => {
    const user = await createNewUser();
    await deleteUser(user.id);
    const {
      requesterId,
      token,
      expiryTime,
      _id,
    } = await TokenGenerator.createNewForId(user.id);

    expect(requesterId.toString()).toEqual(user.id.toString());
    expect(token.length).toEqual(64);
    expect(expiryTime - VALIDITY_PERIOS_IN_MS <= Date.now() + 20).toBeTruthy();
    await TokenGenerator.findByIdAndDelete(_id);
  });
  describe("After Creation", () => {
    describe(" Statics", () => {
      let tokenDetails;
      let user;
      beforeEach(async () => {
        user = await createNewUser();
        await deleteUser(user.id);
        tokenDetails = await createToken(user.id);
      });
      afterEach(async () => {
        await TokenGenerator.findByIdAndDelete(tokenDetails.id);
        tokenDetails = null;
      });

      it("findTokenDetails  returns tokenDetails", async () => {
        const { requesterId, token } = await TokenGenerator.findTokenDetails(
          tokenDetails.token
        );
        expect(requesterId.toString()).toEqual(user.id.toString());

        tokenDetails.expiryTime = Date.now() - VALIDITY_PERIOS_IN_MS;
        await tokenDetails.save();
        const expiredToken = await TokenGenerator.findTokenDetails(
          tokenDetails.token
        );
        expect(expiredToken).toBeNull();
      });

      it("deleteTokenById  delete tokenDetails with the given Id", async () => {
        const tokenId = tokenDetails.id;
        await TokenGenerator.deleteTokenById(tokenId);
        const tokenExist = await TokenGenerator.findById(tokenDetails.id);
        expect(tokenExist).toBeNull();
      });
    });
  });
});
