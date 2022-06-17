const requires = require("../utils/requires");

const { User, Product, AdminSales, Order } = requires.Models;
const {
  startApp,
  getNewDriverInstance,
  closeApp,
  TEST_PORT,
} = require("./config");

const { Page, utilLogin, session } = require("./utils");
const {
  clearModel,
  clearDb,
  createTestProducts,
  feedProductsWithTestCategories,
} = require("../utils/generalUtils/database");
const {
  generateMongooseId,
  generatePerfectProductData,
  generateStringSizeN,
} = require("../utils/generalUtils/utils");
const {
  ensureHasTitle,
  ensureHasTitleAndInfo,
  clearModelsInProductTests,
  ensureHasTitleAndError,
  includeTearDowns,
  clearSessions,
} = require("./utils/generalUtils");
const {
  verifyEqual,
  verifyTruthy,
  verifyFalsy,
} = require("../utils/testsUtils");
const { ranges } = require("../models/utils");
const { logout } = require("./utils/authUtils");

const adminId = generateMongooseId();

const TRIALS = 10;

let page;

const MAX_TEST_PERIOD = 20000;

const PORT = TEST_PORT;
const base = `http://localhost:${PORT}`;

const productPage = base + "/products?page=1";

const data = {
  name: "John Doe ",
  email: "johndoe@email.com",
  password: "Pa55word?",
};

const userLoginUrl = `${base}/auth/user/log-in`;

describe("logged in user can be able to shop", () => {
  let user;
  let products = [];
  beforeAll(async () => {
    await startApp(PORT);
    page = new Page(getNewDriverInstance());
  }, MAX_TEST_PERIOD);
  afterAll(async () => {
    await clearSessions();
    await page.close();
    await clearDb();
    await closeApp();
  });

  beforeEach(async () => {
    user = await utilLogin(page, userLoginUrl, data, "user");
    await ensureHasTitle(page, "Products");
    products = await createTestProducts([adminId], TRIALS);
    await page.openUrl(productPage);
  }, MAX_TEST_PERIOD);

  afterEach(async () => {
    await logout(page);
    await clearDb();
  }, MAX_TEST_PERIOD);

  it("should be able to view products regardless of their category, at first entry", async () => {
    const noOfProducts = 4;
    //want to create a set of new products.
    await clearDb();
    products = await createTestProducts([adminId], noOfProducts);
    await page.openUrl(productPage);
    await ensureNumberOfProductsRenderedAre(noOfProducts);
  });

  describe("Movement to other pages", () => {
    describe("Category", () => {
      it(
        "should click category links",
        async () => {
          const categories = ["category 1", "category 2"];
          const noOfProducts = categories.length;
          await clearDb();
          products = await createTestProducts([adminId], noOfProducts);
          await feedProductsWithTestCategories(products, categories);
          for (const category of categories) {
            //reload incase the there are errors when when rendering the previoius category.
            await page.openUrl(productPage);
            await page.clickLink(category);
            //A category page should come with the category as the title.
            await ensureHasTitle(page, category);
            await ensureNumberOfProductsRenderedAre(1);
          }
        },
        MAX_TEST_PERIOD
      );
      it(
        "should refuse for invalid url params(should refuse when category is out of range)",
        async () => {
          const { maxlength, error } = ranges.product.category;
          await page.openUrl(
            `${base}/category/${generateStringSizeN(maxlength + 1)}?page=1`
          );
          await ensureHasTitleAndError(page, "Products", error);
        },
        MAX_TEST_PERIOD
      );
    });
    it(
      "should click a pagination link ",
      async () => {
        await page.clickLink("1");
        //the passing of this test is that it should not throw.
      },
      MAX_TEST_PERIOD
    );
  });

  it(
    "can add to cart",
    async () => {
      await page.clickByClassName("add-to-cart-btn");
      await ensureHasTitle(page, "Add To Cart");
    },
    MAX_TEST_PERIOD
  );

  test(
    "should be able to click Continue Shopping",
    async () => {
      await clickAddToCart();
      await page.hold(50);
      await page.clickLink("Continue Shopping");
      await ensureHasTitle(page, "Products");
    },
    MAX_TEST_PERIOD
  );

  describe("cart operations", () => {
    afterEach(async () => {
      await resetCart(user.id);
      await clearModelsInProductTests();
    });

    it(
      "should be able view cart",
      async () => {
        await addTRIALProductsToCart(user, products, TRIALS);
        await page.clickLink("Cart");
        await ensureHasTitle(page, "Your Cart");
      },
      MAX_TEST_PERIOD
    );

    describe("Addition to cart", () => {
      it(
        "should be able to add quantity and the push to cart",
        async () => {
          const balance = (await User.findById(user.id)).balance;

          const quantity = 4,
            buyingPrice = 200.3;
          const product = await generateOneProductWithQuantityAndBuyingPrice(
            quantity,
            buyingPrice
          );

          await page.openUrl(productPage);
          await clickAddToCart();
          const addedQuantity = 3;
          await page.enterDataByName("quantity", addedQuantity);
          await clickPushToCart();
          await ensureHasTitleAndInfo(
            page,
            "Products",
            "Product successfully added to cart."
          );
          const savedUser = await User.findById(user.id);
          verifyEqual(savedUser.cart.length, 1);
          verifyEqual(savedUser.cart[0].quantity, addedQuantity);
          //ensure balance is reduced.
          const newBalance = savedUser.balance;
          verifyEqual(
            newBalance,
            Number((balance - product.sellingPrice * addedQuantity).toFixed(2))
          );
          //ensure quantity is also reduced
          const savedProduct = await Product.findById(product.id);
          verifyEqual(savedProduct.quantity, quantity - addedQuantity);
        },
        MAX_TEST_PERIOD
      );

      it(
        "should be shown the current total and current balance when they are about to add to cart.",
        async () => {
          const user = await getUserCurrentData();

          const quantity = 4,
            buyingPrice = 200.3;
          const product = await generateOneProductWithQuantityAndBuyingPrice(
            quantity,
            buyingPrice
          );
          await user.addProductsToCart(product.id, 1);
          const currentUserData = await getUserCurrentData();
          await page.openUrl(productPage);
          await clickAddToCart();
          const total = await page.extractTextById("total");
          const balance = await page.extractTextById("balance");
          verifyEqual(currentUserData.balance, Number(balance));
          verifyEqual(Number(total), product.sellingPrice);
        },
        MAX_TEST_PERIOD
      );

      it(
        "should check to see that the Push To Cart is disabled when the total price exceed the balance.",
        async () => {
          const quantity = 1,
            buyingPrice = 200.3;
          await generateOneProductWithQuantityAndBuyingPrice(
            quantity,
            buyingPrice
          );
          const balance = user.balance;

          await page.openUrl(productPage);
          await clickAddToCart();
          await page.enterDataByName(
            "quantity",
            ranges.product.quantity.max + 1
          );
          await clickPushToCart();
          await ensureHasTitleAndError(
            page,
            "Add To Cart",
            ranges.product.quantity.error
          );
          const savedUser = await User.findById(user.id);
          //ensure not added to cart.
          verifyEqual(savedUser.cart.length, 0);
        },
        MAX_TEST_PERIOD
      );
      it(
        "should be able to delete from cart",
        async () => {
          const balance = (await User.findById(user.id)).balance;
          const quantity = 4,
            buyingPrice = 200.3;
          const product = await generateOneProductWithQuantityAndBuyingPrice(
            quantity,
            buyingPrice
          );
          await page.openUrl(productPage);
          await clickAddToCart();
          await page.enterDataByName("quantity", quantity);
          await clickPushToCart();
          await page.clickLink("Cart");
          await page.clickByClassName("delete");
          await ensureHasTitle(page, "Your Cart");
          const savedUser = await User.findById(user.id);
          //ensure that the cart product is removed from the cart.
          verifyEqual(savedUser.cart.length, 0);
          //ensure that money is refunded
          const newBalance = savedUser.balance;
          verifyEqual(newBalance, balance);
          //ensure quantity is returned.
          const savedProduct = await Product.findById(product.id);
          verifyEqual(savedProduct.quantity, quantity);
        },
        MAX_TEST_PERIOD
      );

      it(
        "should refuse when user enter quantity greater than the present quantity ",
        async () => {
          await clearModelsInProductTests();
          const product = generatePerfectProductData();
          const presentQuantity = 1;

          //reset the  default values since the default user balance is very small. The default values generated are very large.
          product.buyingPrice = 200.0;
          product.percentageProfit = 1;
          product.quantity = 1;
          product.quantity = await Product.createOne(product);
          //reload since the product in the database have changed.
          await page.openUrl(productPage);
          await clickAddToCart();
          await page.enterDataByName("quantity", presentQuantity + 1);

          await ensureHasTitleAndError(
            page,
            "Add To Cart",
            `On stock quantity is ${presentQuantity}.Please request less quantity`
          );

          const savedUser = await User.findById(user.id);
          //ensure product is not added to cart
          verifyEqual(savedUser.cart.length, 0);
        },
        MAX_TEST_PERIOD
      );
    });

    it(
      "should be able order products",
      async () => {
        const testUser = await User.findOne({ name: user.name });
        const product1 = products[0];
        const product2 = products[1];
        const productsToAdd = [product1, product2];
        const quantityToAddPerProduct = 1;
        await addTRIALProductsToCart(
          testUser,
          productsToAdd,
          quantityToAddPerProduct
        );
        await page.openUrl(`${base}/cart`);
        await page.clickById("order-now");
        await ensureHasTitle(page, "Your Orders");
        await ensureUserCartIsCleared();
        await ensureSalesAreAddedToAdminId(
          productsToAdd,
          quantityToAddPerProduct
        );
      },
      MAX_TEST_PERIOD
    );
    it(
      "should be able to view order download invoice",
      async () => {
        const data = await createOrderData();
        await Order.createOne(data);
        await page.openUrl(`${base}/orders`);
        await page.clickLink("Download Invoice");

        await page.hold(5000);
        //reopen the product
        await page.openUrl(productPage);
      },
      MAX_TEST_PERIOD
    );
    async function createOrderData() {
      const testQuantity = 4;
      const testProduct = products[0];
      testProduct.sellingPrice = 200;
      await testProduct.save();
      return {
        userId: user.id,
        products: [
          {
            productData: products[0],
            quantity: testQuantity,
          },
        ],
        total: testQuantity * products[0].sellingPrice,
      };
    }

    async function getUserCurrentData() {
      return await User.findById(user.id);
    }
  });

  async function ensureNumberOfProductsRenderedAre(expected) {
    const articles = await page.getELements("article");
    verifyEqual(articles.length, expected);
  }

  async function clickAddToCart() {
    await page.clickByClassName("add-to-cart-btn");
  }
  async function clickPushToCart() {
    await page.clickById("push-to-cart-btn");
  }

  async function ensureUserCartIsCleared() {
    const savedUser = await User.findById(user.id);
    verifyEqual(savedUser.cart.length, 0);
  }

  async function ensureSalesAreAddedToAdminId(
    productsAdded,
    quantityAddedPerProduct
  ) {
    const admin = await AdminSales.findOneByAdminId(adminId);
    const soldProducts = admin.products;
    const findResults = [];
    verifyEqual(productsAdded.length, soldProducts.length);
    for (const product of productsAdded) {
      let found = false;
      for (const soldProduct of soldProducts) {
        if (soldProduct.productData._id.toString() === product._id.toString())
          found = true;
      }
      findResults.push(found);
    }
    let allNotFound = false;
    for (const findResult of findResults) {
      if (!findResult) allNotFound = true;
    }

    verifyFalsy(allNotFound);
  }
});

async function addTRIALProductsToCart(user, products, quantityToAddPerProduct) {
  for (const product of products) {
    await user.addProductsToCart(product.id, quantityToAddPerProduct);
  }
}
async function resetCart(id) {
  const user = await User.findById(id);
  user.cart = [];
  return await user.save();
}

async function generateOneProductWithQuantityAndBuyingPrice(
  quantity,
  buyingPrice
) {
  await clearModelsInProductTests();
  const productData = generatePerfectProductData();
  //the auto product generator is generating wierdly huge values.
  productData.quantity = quantity;
  productData.buyingPrice = buyingPrice;
  return await Product.createOne(productData);
}
