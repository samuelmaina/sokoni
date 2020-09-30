const { User, Product, Admin } = require("../../database/models/index");
const baseTest = require("./baseAdminAndUser");

let name = "samuel Maina";
let password = "Smainachez6891?";
let email = "samuelmayna@gmail.com";
let user;
describe("----User Database", () => {
  baseTest(User);
  let trials = 10;
  const products = [];
  describe(" Purchase Tests", () => {
    beforeEach(async () => {
      user = await User.createNew({ name, email, password });
      const admin = await Admin.createNew({
        name: "Samuel Maina",
        email,
        password: "Smaichez*55",
      });
      for (let index = 0; index < trials; index++) {
        products[index] = await Product.createNew({
          title: ` test ${Math.floor(Math.random() * 100)}`,
          imageUrl: `to/${Math.floor(Math.random() * 100)}some/path.jpeg`,
          buyingPrice: Math.floor(Math.random() * 100),
          percentageProfit: Math.floor(Math.random() * 100),
          expirationPeriod: Math.floor(Math.random() * 100),
          description: `the first user test at  ${Math.floor(
            Math.random() * 100
          )} `,
          quantity: Math.floor(Math.random() * 100),
          adminId: admin._id,
          category: `category ${Math.floor(Math.random() * 100)}`,
          brand: `brand ${Math.floor(Math.random() * 100)}`,
        });
      }
    });
    afterEach(async () => {
      await Admin.findOneAndDelete({ email });
      await User.findByIdAndDelete(user.id);
      for (let index = 0; index < trials; index++) {
        const id = products[index].id;
        await Product.findByIdAndDelete(id);
      }
    });
    describe(" Cart Operations", () => {
      it("addProductIdToCart add products to cart", async () => {
        for (let index = 0; index < trials; index++) {
          await user.addProductIdToCart(products[index].id, trials);
        }
        let product;
        for (let index = 0; index < trials; index++) {
          product = user.cart[index];
          expect(product.quantity).toEqual(trials);
          expect(product.productData).toEqual(products[index]._id);
        }
      });
      it("addProductIdToCart only increases quantity when productId is in cart ", async () => {
        for (let index = 0; index < trials; index++) {
          await user.addProductIdToCart(products[index].id, trials);
        }
        let product;
        for (let index = 0; index < trials; index++) {
          product = user.cart[index];
          await user.addProductIdToCart(products[index].id, trials);
          expect(product.quantity).toEqual(2 * trials);
          //ensure that no other product id is added to the cart when we add the same product ids
          expect(user.cart.length).toEqual(trials);
        }
      });
      it("deleteProductIdFromCart deletes product Id from cart and returns the deleted quantity ", async () => {
        for (let index = 0; index < trials; index++) {
          await user.addProductIdToCart(products[index].id, trials);
        }
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
        for (let index = 0; index < trials; index++) {
          await user.addProductIdToCart(products[index].id, trials);
        }
        await user.clearCart();
        expect(user.cart.length).toEqual(0);
      });
      it("getCartProducts  returns the user cart proroducts", async () => {
        for (let index = 0; index < trials; index++) {
          await user.addProductIdToCart(products[index].id, trials);
        }
        let cartProducts = user.cart;
        const returnedProducts = user.getCartProducts();
        expect(cartProducts).toEqual(returnedProducts);
      });
    });
    it("findCartProductsAndTheirTotalForId finds carts products and their totals for", async () => {
      let expectedTotal = 0.0;

      for (let index = 0; index < trials; index++) {
        let selligPrice = products[index].getSellingPrice();
        await user.addProductIdToCart(products[index].id, trials);
        expectedTotal += selligPrice * trials;
      }
      expectedTotal = expectedTotal.toFixed(2);
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
