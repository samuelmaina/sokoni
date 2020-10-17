const {User} = require("../../../database/models");

const {
  verifyTruthy,
  verifyFalsy,
  verifyEqual,
  verifyIDsAreEqual,
} = require("../../utils/testsUtils");
const {
  createNewUser,
  createTestProducts,
  createNewAdmin,
  clearTheDb,
} = require("../../utils/generalUtils");

const userUtils = require("./user");

const TRIALS = 10;

const baseTest = require("../baseAdminAndUser");

const {connectToDb, closeConnectionToBd} = require("../../config");

let user;
let admin;
let products = [];

describe("----User Database", () => {
  beforeAll(async () => {
    await connectToDb();
  });
  baseTest(User);
  describe(" Purchase Tests", () => {
    beforeAll(async () => {
      user = await createNewUser();
      admin = await createNewAdmin();
      products = await createTestProducts(admin.id, TRIALS);
      userUtils.setProducts(products);
      userUtils.setUser(user);
      userUtils.setTrials(TRIALS);
    });
    afterAll(async () => {
      await clearTheDb();
    });
    afterEach(async () => {
      await userUtils.resetCart();
    });
    describe(" Cart Operations", () => {
      it("addProductIdToCart add products to cart", async () => {
        for (let index = 0; index < TRIALS; index++) {
          await user.addProductIdToCart(products[index].id, TRIALS);
        }
        const userCart = user.cart;
        let product;
        for (let index = 0; index < TRIALS; index++) {
          product = userCart[index];

          //we are matching  product[index] to cart[index] (i.e product[0] is
          //added first at cart[0] )  when adding to cart
          //so we expect the ids to match perfectly.
          verifyIDsAreEqual(product.productData, products[index].id);
          verifyEqual(product.quantity, TRIALS);
        }
      });
      it("addProductIdToCart only increases quantity when productId is in cart ", async () => {
        for (let index = 0; index < TRIALS; index++) {
          await user.addProductIdToCart(products[index].id, TRIALS);
        }
        let product;
        let userCart = user.cart;
        for (let index = 0; index < TRIALS; index++) {
          product = userCart[index];
          await user.addProductIdToCart(products[index].id, TRIALS);
          verifyEqual(product.quantity, 2 * TRIALS);
          //ensure that no other product ids are added to the cart when we add the same product ids
          verifyEqual(userCart.length, TRIALS);
        }
      });
      it("deleteProductIdFromCart deletes product Id from cart and returns the deleted quantity ", async () => {
        await userUtils.addTRIALProductsToCart();
        let userCart = user.cart;
        for (let index = 0; index < TRIALS; index++) {
          const productQuantity = userCart[index].quantity;
          let isFound = userUtils.productFound(products[index].id);

          //ensure that the product is found before we start with the deletion
          verifyTruthy(isFound);
          const deletedQuntity = await user.deleteProductIdFromCart(
            products[index].id
          );
          isFound = userUtils.productFound(products[index].id);
          verifyFalsy(isFound);
          verifyEqual(deletedQuntity, productQuantity);
        }
        //we have deleted everything,so nothing should be there.
        verifyEqual(user.cart.length, 0);
      });
      it("clearCart clears the cart", async () => {
        await userUtils.addTRIALProductsToCart();
        await user.clearCart();
        verifyEqual(user.cart.length, 0);
      });
      it("getCartProducts  returns the user cart products", async () => {
        await userUtils.addTRIALProductsToCart();
        let userCart = user.cart;
        const returnedProducts = user.getCartProducts();
        verifyEqual(userCart, returnedProducts);
      });
    });
    it("findCartProductsAndTheirTotalForId finds carts products and their totals for", async () => {
      await userUtils.addTRIALProductsToCart();
      let expectedTotal = userUtils.getTotals();
      const {
        cartProducts,
        total,
      } = await User.findCartProductsAndTheirTotalForId(user.id);

      for (let index = 0; index < TRIALS; index++) {
        //we added TRIALS so we expect TRIALS
        const {productData, quantity} = cartProducts[index];
        verifyEqual(quantity, TRIALS);
        const expectedProductData = products[index];

        //check that the sellingPrice and title  are  populated.
        verifyEqual(productData.selligPrice, expectedProductData.selligPrice);
        verifyEqual(productData.title, expectedProductData.title);
      }
      expect(total).toEqual(expectedTotal);
    });
    describe("balance manipulation", () => {
      it("incrementAccountBalance increases the  balance of the user", async () => {
        let previous, increase, final;
        previous = 10000;
        increase = 1000;
        final = previous + increase;
        user.currentBalance = previous;
        await user.save();
        await user.incrementAccountBalance(increase);
        verifyEqual(user.currentBalance, final);
      });
      it("reduceBalance reduces balance", async () => {
        let previous, reduction;
        previous = 10000;
        reduction = 1000;
        final = previous - reduction;
        user.currentBalance = previous;
        await user.save();
        await user.reduceBalance(reduction);
        verifyEqual(user.currentBalance, final);
      });
    });
  });
});
