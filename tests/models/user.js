const {User} = require("../../database/models");
const {
  createNewUser,
  createTestProducts,
  createNewAdmin,
  deleteAllProducts,
  deleteAdminById,
  deleteUserById,
} = require("../utils/generalUtils");

const TRIALS = 10;

const baseTest = require("./baseAdminAndUser");

const {connectToDb, closeConnectionToBd} = require("../config");

let user;
let admin;
let products = [];

describe("----User Database", () => {
  beforeAll(async () => {
    await connectToDb();
  });
  afterAll(async () => {
    await closeConnectionToBd();
  });

  baseTest(User);
  describe(" Purchase Tests", () => {
    beforeAll(async () => {
      user = await createNewUser();
      admin = await createNewAdmin();
      products = await createTestProducts(admin.id, TRIALS);
    });
    afterAll(async () => {
      await deleteAdminById(admin.id);
      await deleteUserById(user.id);
      await deleteAllProducts(products);
    });
    afterEach(async () => {
      await resetCart();
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

          //we are matching  product[index] to cart[index] when adding to cart
          //so we expect the ids to match perfectly.
          expect(product.productData.toString()).toEqual(products[index].id.toString());
          expect(product.quantity).toEqual(TRIALS);
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
          expect(product.quantity).toEqual(2 * TRIALS);
          //ensure that no other product ids are added to the cart when we add the same product ids
          expect(userCart.length).toEqual(TRIALS);
        }
      });
      it("deleteProductIdFromCart deletes product Id from cart and returns the deleted quantity ", async () => {
        await addTRIALProductsToCart();
        let userCart = user.cart;
        for (let index = 0; index < TRIALS; index++) {
          const productQuantity = userCart[index].quantity;
          let isFound = productFound(products[index].id);
          //ensure that the product is found before we start with the deletion
          expect(isFound).toBeTruthy();
          const deletedQuntity = await user.deleteProductIdFromCart(products[index].id);
          isFound = productFound(products[index].id);
          expect(isFound).toBeFalsy();
          expect(deletedQuntity).toEqual(productQuantity);
        }
        //we have deleted everything,so nothing should be there.
        expect(user.cart.length).toEqual(0);
      });
      it("clearCart clears the cart", async () => {
        await addTRIALProductsToCart();
        await user.clearCart();
        expect(user.cart.length).toEqual(0);
      });
      it("getCartProducts  returns the user cart proroducts", async () => {
        await addTRIALProductsToCart();
        let userCart = user.cart;
        const returnedProducts = user.getCartProducts();
        expect(userCart).toEqual(returnedProducts);
      });
    });
    it("findCartProductsAndTheirTotalForId finds carts products and their totals for", async () => {
      await addTRIALProductsToCart();
      let expectedTotal = getTotals();
      const {cartProducts, total} = await User.findCartProductsAndTheirTotalForId(
        user.id
      );

      for (let index = 0; index < TRIALS; index++) {
        //we added TRIALS so we expect TRIALS
        const {productData, quantity} = cartProducts[index];
        expect(quantity).toEqual(TRIALS);
        const expectedProductData = products[index];

        //check that the sellingPrice and title  are  populated.
        expect(productData.selligPrice).toEqual(expectedProductData.selligPrice);
        expect(productData.title).toEqual(expectedProductData.title);
      }
      expect(total).toEqual(expectedTotal);
    });
    describe("balance manipulation", () => {
      it("incrementAccountBalance increases the  balance of the user", async () => {
        let previous, increase;
        previous = 10000;
        increase = 1000;
        user.currentBalance = previous;
        await user.save();

        await user.incrementAccountBalance(increase);
        expect(user.currentBalance).toEqual(previous + increase);
      });
      it("reduceBalance reduces balance", async () => {
        let previous, reduction;
        previous = 10000;
        reduction = 1000;

        user.currentBalance = previous;
        await user.save();
        await user.reduceBalance(reduction);
        expect(user.currentBalance).toEqual(previous - reduction);
      });
    });
  });
});

const resetCart = async () => {
  user.cart = [];
  user = await user.save();
};
const getTotals = () => {
  let total = 0.0;
  for (let index = 0; index < TRIALS; index++) {
    let sellingPrice = products[index].sellingPrice;
    total += sellingPrice * TRIALS;
  }
  return Number(total.toFixed(2));
};

const addTRIALProductsToCart = async () => {
  for (let index = 0; index < TRIALS; index++) {
    await addProductToCart(products[index].id, TRIALS);
  }
};
const addProductToCart = async (productId, quantity) => {
  const userCart = user.cart;
  const productIndex = userCart.findIndex((product) => {
    return product.productData.toString() === productId.toString();
  });
  const data = {
    productData: productId,
    quantity,
  };
  if (productIndex < 0) {
    userCart.push(data);
  } else {
    userCart[productIndex].quantity += quantity;
  }
  user.cart = userCart;
  user = await user.save();
};

const productFound = (productId) => {
  const userCart = user.cart;
  const productIndex = userCart.findIndex((product) => {
    return product.productData.toString() === productId.toString();
  });
  return productIndex >= 0;
};
