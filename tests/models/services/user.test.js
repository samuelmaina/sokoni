const requires = require("../../utils/requires");
const { userServices } = requires.services;

const { generateMongooseId } = require("../../utils/generalUtils/utils");
const {
  ensureArrayContains,
  verifyEqual,
  verifyIDsAreEqual,
  ensureObjectHasKeyValuePair,
} = require("../../utils/testsUtils");
const { addProductIdToCart, deleteProductIdfromCart } = userServices;

describe("User services", () => {
  describe("addProductIdToCart", () => {
    it("should add productId and quantity to the cart", () => {
      const cart = [];
      const productId = generateMongooseId();
      const quantity = 20;
      addProductIdToCart(cart, productId, quantity);
      verifyEqual(cart.length, 1);
      ensureCartHasProductwithData(cart, productId, quantity);
    });
    it("should only add quantity if the productId already exists in array", () => {
      const cart = [];
      const productId = generateMongooseId();
      const quantity = 20;
      addProductIdToCart(cart, productId, quantity);
      addProductIdToCart(cart, productId, quantity);
      verifyEqual(cart.length, 1);
      const newQuantity = quantity * 2;
      ensureCartHasProductwithData(cart, productId, newQuantity);
    });
  });
  describe("deleteProductIdfromCart", () => {
    it("should remove productId from cart", () => {
      const productId = generateMongooseId();
      const productId2 = generateMongooseId();
      const cart = [];
      const quantity = 50;
      const productIds = [productId, productId2];
      addProductIdsToCart(cart, productIds, quantity);
      const { updated } = deleteProductIdfromCart(cart, productId);
      verifyEqual(updated.length, 1);
      ensureCartHasProductwithData(updated, productId2, quantity);
    });
    it("should return the quantity that is deleted", () => {
      const productId = generateMongooseId();
      const productId2 = generateMongooseId();
      const quantity = 50,
        quantity2 = 23;
      const cart = [];
      addProductIdToCart(cart, productId, quantity);
      addProductIdToCart(cart, productId2, quantity2);

      const { deletedQuantity } = deleteProductIdfromCart(cart, productId2);
      verifyEqual(deletedQuantity, quantity2);
    });
  });
});

function addProductIdsToCart(cart, productIds, quantity) {
  for (const productId of productIds) {
    cart.push({
      productData: productId,
      quantity,
    });
  }
}

function ensureCartHasProductwithData(cart, productId, quantity) {
  //the productData is used to stored an id that will be used to
  //populate the product data such as title using the provided productId,
  //the name productData is suitable as it is more representative of the product data
  //that will be populated later.
  expect(cart).toContainEqual({
    productData: productId,
    quantity,
  });
}
