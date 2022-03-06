const requires= require("../utils/requires");


const { User } = requires.Models;
const {
  clearDb,
  createUserWithData,
} = require("../utils/generalUtils/database");
const baseTest = require("./baseAuth");
const { generateMongooseId } = require("../utils/generalUtils/utils");
const {
  verifyEqual,
  ensureArrayContains,
  ensureObjectHasKeyValuePair,
  ensureObjectHasProps,
} = require("../utils/testsUtils");
const { includeSetUpAndTearDown } = require("./utils");
const credentials = {
  name: "John Doe",
  email: "johndoe@email.com",
  password: "PassWord55?",
};

describe.skip("User test", () => {
  includeSetUpAndTearDown();
  describe("Auth tests", () => {
    baseTest(User);
  });
  describe("user methods", () => {
    let user;
    beforeEach(async () => {
      user = await User.createOne(credentials);
    });
    afterEach(async () => {
      await clearDb();
    });
    describe("user methods", () => {
      it("should add product to cart ", async () => {
        const productId = generateMongooseId();
        const quantity = 50;
        await user.addProductsToCart(productId, quantity);
        const cart = user.cart;
        verifyEqual(cart.length, 1);
        const first = cart[0];
        verifyProductData(first);
      });
      it("should remove product from cart", async () => {
        const productId = generateMongooseId();
        const productId2 = generateMongooseId();
        const quantity = 50;
        await user.addProductsToCart(productId, quantity);
        await user.addProductsToCart(productId2, quantity * 2);
        const deletedQuantity = await user.deleteProductIdFromCart(productId);
        const cart = user.cart;
        verifyEqual(cart.length, 1);
        verifyEqual(deletedQuantity, quantity);
        const remaining = cart[0];
        verifyProductData(remaining);
      });
      it("decrement balance", async () => {
        let initial = 10000,
          decrement = 2000;
        user.balance = initial;
        await user.save();
        await user.decrementBalance(decrement);
        verifyEqual(user.balance, initial - decrement);
      });
    });
  });
});

function verifyProductData(product) {
  const props = ["productData", "quantity"];
  ensureObjectHasProps(product, props);
}
