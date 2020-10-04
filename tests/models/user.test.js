const { User, Admin } = require("../../database/models");
const {
  createNewUser,
  createTestProducts,
  createNewAdmin,
  deleteAllProducts,
  deleteAdmin,
  deleteUser,
} = require("../utils");

const baseTest = require("./baseAdminAndUser");

describe("----User Database", () => {
  let user;
  let admin;
  baseTest(User);
  const trials = 10;
  let products = [];
  const resetCart = async () => {
    user.cart = [];
    user = await user.save();
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

  const addSomeProductsToCart = async () => {
    for (let index = 0; index < trials; index++) {
      await addProductToCart(products[index].id, trials);
    }
  };

  describe(" Purchase Tests", () => {
    beforeAll(async () => {
      user = await createNewUser();
      admin = await createNewAdmin();
      products = await createTestProducts(admin.id, trials);
    });
    afterAll(async () => {
      await deleteAdmin(admin.id);
      await deleteUser(user.id);
      await deleteAllProducts(products);
    });
    afterEach(async () => {
      await resetCart();
    });
    describe(" Cart Operations", () => {
      it("addProductIdToCart add products to cart", async () => {
        for (let index = 0; index < trials; index++) {
          await user.addProductIdToCart(products[index].id, trials);
        }
        const userCart = user.cart;
        let product;
        for (let index = 0; index < trials; index++) {
          product = userCart[index];
          expect(product.productData.toString()).toEqual(
            products[index].id.toString()
          );
          expect(product.quantity).toEqual(trials);
        }
      });
      it("addProductIdToCart only increases quantity when productId is in cart ", async () => {
        for (let index = 0; index < trials; index++) {
          await user.addProductIdToCart(products[index].id, trials);
        }
        let product;
        let userCart = user.cart;
        for (let index = 0; index < trials; index++) {
          product = userCart[index];
          await user.addProductIdToCart(products[index].id, trials);
          expect(product.quantity).toEqual(2 * trials);
          //ensure that no other product id is added to the cart when we add the same product ids
          expect(userCart.length).toEqual(trials);
        }
      });
      it("deleteProductIdFromCart deletes product Id from cart and returns the deleted quantity ", async () => {
        await addSomeProductsToCart();
        let cartProducts = user.cart;
        for (let index = 0; index < trials; index++) {
          const productQuantity = cartProducts[index].quantity;

          const isFound =
            cartProducts.findIndex((product) => {
              return (
                product.productData.toString() === products[index].id.toString()
              );
            }) >= 0;

          const notFound =
            cartProducts.findIndex((product) => {
              return product.productData === products[index].id;
            }) < 0;

          //ensure that the product is found before we start with the deletion
          expect(isFound).toBeTruthy();
          const deletedQuntity = await user.deleteProductIdFromCart(
            products[index].id
          );
          expect(notFound).toBeTruthy();
          expect(deletedQuntity).toEqual(productQuantity);
        }
        //we have deleted everything,so nothing should be there.
        expect(user.cart.length).toEqual(0);
      });
      it("clearCart clears the cart", async () => {
        await addSomeProductsToCart();
        await user.clearCart();
        expect(user.cart.length).toEqual(0);
      });
      it("getCartProducts  returns the user cart proroducts", async () => {
        await addSomeProductsToCart();
        let cartProducts = user.cart;
        const returnedProducts = user.getCartProducts();
        expect(cartProducts).toEqual(returnedProducts);
      });
    });
    it("findCartProductsAndTheirTotalForId finds carts products and their totals for", async () => {
      await addSomeProductsToCart();
      let expectedTotal = 0.0;
      for (let index = 0; index < trials; index++) {
        let selligPrice = products[index].getSellingPrice();
        expectedTotal += selligPrice * trials;
      }
      expectedTotal = Number(expectedTotal.toFixed(2));
      const {
        cartProducts,
        total,
      } = await User.findCartProductsAndTheirTotalForId(user.id);

      for (let index = 0; index < trials; index++) {
        //we added trials so we expect trials
        expect(cartProducts[index].quantity).toEqual(trials);

        const productData = cartProducts[index].productData;
        const expectedProductData = products[index];

        //check that the sellingPrice and title  are  populated.
        expect(productData.selligPrice).toEqual(
          expectedProductData.selligPrice
        );
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
