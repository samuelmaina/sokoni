const requires = require("../utils/requires");

const { ValidationError } = require("./utils");

const { User } = requires.Models;
const {
  clearDb,
  createUserWithData,
  createTestProducts,
} = require("../utils/generalUtils/database");
const baseTest = require("./baseAuth");
const {
  generateMongooseId,
  generateRandomMongooseIds,
} = require("../utils/generalUtils/utils");
const {
  verifyEqual,
  ensureArrayContains,
  ensureObjectHasKeyValuePair,
  ensureObjectHasProps,
  verifyThrowsError,
  verifyRejectsWithError,
} = require("../utils/testsUtils");
const { includeSetUpAndTearDown } = require("./utils");
const credentials = {
  name: "John Doe",
  email: "johndoe@email.com",
  password: "PassWord55?",
};

describe("User test", () => {
  includeSetUpAndTearDown();
  // describe("Auth tests", () => {
  //   baseTest(User);
  // });
  describe("user methods", () => {
    let user;
    beforeEach(async () => {
      user = await User.createOne(credentials);
    });
    afterEach(async () => {
      await clearDb();
    });
    describe("user methods", () => {
      describe("addProductsToCart", () => {
        it("should add productId to cart", async () => {
          const products = await createTestProducts([generateMongooseId()], 1);
          await user.addProductsToCart(products[0].id, 1);
          const cart = user.cart;
          verifyEqual(cart.length, 1);
          const first = cart[0];
          verifyProductData(first);
        });
        describe("increment the total when adding new product", () => {
          it("for the first product", async () => {
            const products = await createTestProducts(
              generateRandomMongooseIds(1),
              1
            );
            const quantity = 50;
            let total = products[0].sellingPrice * quantity;
            await user.addProductsToCart(products[0].id, quantity);
            verifyEqual(user.total, total);
          });

          it("for more than 1 products", async () => {
            const noOfTestProducts = 2;
            const quantity = 50;

            const products = await createTestProducts(
              generateRandomMongooseIds(noOfTestProducts),
              quantity * noOfTestProducts
            );

            let total = 0;
            for (const product of products) {
              total += product.sellingPrice * quantity;
              await user.addProductsToCart(product.id, quantity);
            }
            verifyEqual(user.total, total);
          });
        });
      });
      describe("deleteProductIdFromCart", () => {
        it("should remove product from cart", async () => {
          const noOfTestProducts = 2;
          const quantity = 50;

          const products = await createTestProducts(
            generateRandomMongooseIds(noOfTestProducts),
            noOfTestProducts
          );
          for (const product of products) {
            await user.addProductsToCart(product.id, quantity);
          }
          await user.deleteProductIdFromCart(products[1].id);
          const cart = user.cart;
          verifyEqual(cart.length, 1);
          const remaining = cart[0];
          verifyProductData(remaining);
        });

        it("should return the quantity of the deleted products", async () => {
          const noOfTestProducts = 2;
          const quantity = 50;

          const products = await createTestProducts(
            generateRandomMongooseIds(noOfTestProducts),
            noOfTestProducts
          );
          for (const product of products) {
            await user.addProductsToCart(product.id, quantity);
          }
          const deletedQuantity = await user.deleteProductIdFromCart(
            products[1].id
          );

          verifyEqual(deletedQuantity, quantity);
        });

        it("should reduce the total when deleting the product", async () => {
          const noOfTestProducts = 3;
          const quantity = 50;

          const products = await createTestProducts(
            generateRandomMongooseIds(noOfTestProducts),
            noOfTestProducts
          );

          let total = 0;
          for (const product of products) {
            total += product.sellingPrice * quantity;
            await user.addProductsToCart(product.id, quantity);
          }

          await user.deleteProductIdFromCart(products[1].id);
          verifyEqual(
            user.total,
            Number((total - products[1].sellingPrice * quantity).toFixed(2))
          );
        });
      });

      describe("Decrement Balance", () => {
        it("rufuse to reduce amount less than 1", async () => {
          let initial = 10000,
            decrement = 0;
          await setUserBalance(initial);

          await verifyRejectsWithError(() => {
            return user.decrementBalance(decrement);
          }, "Must reduce a positive amount.");
        });

        it("rufuse to reduce amount greater than the database range ", async () => {
          let initial = 2000000 + 1;
          await verifyRejectsWithError(async () => {
            user.balance = initial;
            await user.save();
          }, ValidationError);
        });

        it("rufuse to increase amount greater than the current balance", async () => {
          let initial = 10000,
            decrement = initial + 1;
          await setUserBalance(initial);
          await verifyRejectsWithError(() => {
            return user.decrementBalance(decrement);
          }, "Can not reduce such an amount.");
        });
      });

      it("add balance", async () => {
        let initial = 10000,
          increase = 2000;
        await setUserBalance(initial);
        await user.incrementBalance(increase);
        verifyEqual(user.balance, initial + increase);
      });

      async function setUserBalance(balance) {
        user.balance = balance;
        await user.save();
      }
    });
  });
});

function verifyProductData(product) {
  const props = ["productData", "quantity"];
  ensureObjectHasProps(product, props);
}
