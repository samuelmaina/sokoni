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
  clearTheDb,
  generateRandomMongooseIds,
} = require("../../utils/generalUtils");

const userUtils = require("./util");

const MAX_TEST_TIME = 5000;

const TRIALS = 50;

const baseTest = require("../baseAdminAndUser");

const {includeSetUpAndTearDown} = require("../utils");

let user;
let products = [];

describe.skip("----User Database", () => {
  includeSetUpAndTearDown();
  //baseTest(User);
  describe("Purchase Tests", () => {
    const generateNTestProducts = async N => {
      return await createTestProducts(generateRandomMongooseIds(N), N);
    };
    beforeAll(async () => {
      user = await createNewUser();
    }, MAX_TEST_TIME);
    afterEach(async () => {
      await userUtils.resetCart(user);
      await clearTheDb();
    }, MAX_TEST_TIME);
    describe(" Cart Operations", () => {
      it(
        "addProductsToCart add products to cart",
        async () => {
          for (let index = 0; index < TRIALS; index++) {
            let productId = products[index].id;
            await user.addProductsToCart(productId, TRIALS);
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
        },
        MAX_TEST_TIME
      );

      it(
        "addProductsToCart only increases quantity when productId is in cart ",
        async () => {
          for (let index = 0; index < TRIALS; index++) {
            await user.addProductsToCart(products[index].id, TRIALS);
          }
          let product;
          let userCart = user.cart;
          for (let index = 0; index < TRIALS; index++) {
            product = userCart[index];
            await user.addProductsToCart(products[index].id, TRIALS);
            verifyEqual(product.quantity, 2 * TRIALS);
            //ensure that no other product ids are added to the cart when we add the same product ids
            verifyEqual(userCart.length, TRIALS);
          }
        },
        MAX_TEST_TIME
      );

      it(
        "deleteProductsFromCart deletes products with productId from cart and returns the deleted quantity ",
        async () => {
          await userUtils.addTRIALProductsToCart(user, products, TRIALS);
          let userCart = user.cart;
          for (let index = 0; index < TRIALS; index++) {
            const productQuantity = userCart[index].quantity;
            let isFound = userUtils.productFound(userCart, products[index].id);
            //ensure that the product is found before we start with the deletion
            verifyTruthy(isFound);
            const deletedQuntity = await user.deleteProductsFromCart(
              products[index].id
            );
            isFound = userUtils.productFound(user.cart, products[index].id);
            verifyFalsy(isFound);
            verifyEqual(deletedQuntity, productQuantity);
          }
          //we have deleted everything,so nothing should be there.
          verifyEqual(user.cart.length, 0);
        },
        MAX_TEST_TIME
      );
      it(
        "populateCartProductsDetails returns a cart with a populated cart.",
        async () => {
          await userUtils.addTRIALProductsToCart(user, products, TRIALS);
          const populated = await user.populateCartProductsDetails();
          const expectedtotal = userUtils.getTotals(user.cart, TRIALS);
          userUtils.ensureProductsHaveProperties(populated.cart, [
            "sellingPrice",
            "title",
          ]);
          verifyEqual(expectedtotal, populated.total);
        },
        MAX_TEST_TIME
      );
      it(
        "clearCart clears the cart",
        async () => {
          await userUtils.addTRIALProductsToCart(user, products, TRIALS);
          await user.clearCart();
          verifyEqual(user.cart.length, 0);
        },
        MAX_TEST_TIME
      );
    });

    describe("balance manipulation", () => {
      it("incrementBalance increases the  balance of the user", async () => {
        let previous, increase, final;
        previous = 10000;
        increase = 1000;
        final = previous + increase;
        await resetUserBalance(previous);
        await user.incrementBalance(increase);
        verifyEqual(user.balance, final);
      });
      it("decrementBalance reduces balance", async () => {
        let previous, reduction;
        previous = 10000;
        reduction = 1000;
        final = previous - reduction;
        await resetUserBalance(previous);
        await user.decrementBalance(reduction);
        verifyEqual(user.balance, final);
      });
    });
    const resetUserBalance = async balance => {
      user.balance = balance;
      await user.save();
    };
  });
});
