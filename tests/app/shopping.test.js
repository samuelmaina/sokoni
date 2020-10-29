const {User, Product} = require("../../database/models");
const {startApp, getNewDriverInstance, closeApp} = require("./config");
const {
  createTestProducts,
  clearTheDb,
  clearDataFromAModel,
  generateMongooseId,
} = require("../utils/generalUtils");

const {Page, utilLogin, session} = require("./utils");

const adminId = generateMongooseId();

const TRIALS = 10;

let page;

const MAX_TEST_PERIOD = 20000;

const PORT = 5000;
const base = `http://localhost:${PORT}`;
const homePage = `${base}/`;

const user = {
  name: "Samuel Maina",
  email: "samuelmayna@gmail.com",
  password: "Smain68219",
};
describe("logged in user can be able to shop", () => {
  let products = [];
  beforeAll(async () => {
    await startApp(PORT);
    page = new Page(getNewDriverInstance());
    const userLoginUrl = `${base}/auth/user/log-in`;
    await utilLogin(page, userLoginUrl, user, "user");
  }, MAX_TEST_PERIOD);
  afterAll(async () => {
    await session.clearSessions();
    await page.close();
    await clearTheDb();
    await closeApp();
  });

  beforeEach(async () => {
    products = await createTestProducts(adminId, TRIALS);
    await page.openUrl(homePage);
  }, MAX_TEST_PERIOD);
  afterEach(async () => {
    await clearDataFromAModel(Product);
  });

  it(
    "can add to cart",
    async () => {
      await page.clickByClassName("add-to-cart-btn");
      const title = await page.getTitle();
      expect(title).toEqual("Add To Cart");
    },
    MAX_TEST_PERIOD
  );
  it(
    "should be able to add quantity and the push to cart",
    async () => {
      await page.clickByClassName("add-to-cart-btn");
      await page.hold(500);
      await page.enterDataByName("quantity", 4);
      await page.clickByClassName("push-to-cart-btn");
      const title = await page.getTitle();
      const info = await page.getInfo();
      expect(title).toEqual("Products");
      expect(info).toEqual("Product successfully added to cart.");
    },
    MAX_TEST_PERIOD
  );
  it(
    "should be able to click Continue Shopping",
    async () => {
      await page.clickByClassName("add-to-cart-btn");
      await page.hold(500);
      await page.clickLink("Continue Shopping");
      const title = await page.getTitle();
      expect(title).toEqual("Products");
    },
    MAX_TEST_PERIOD
  );
  test.skip(
    "should be able view cart",
    async () => {
      const testUser = await User.findOne({name: user.name});
      products.forEach(product => {
        testUser.cart.push({
          productData: product.id,
          quantity: 1,
        });
      });
      await testUser.save();
      await page.clickLink("Cart");
      const title = await page.getTitle();
      expect(title).toEqual("Your Cart");
    },
    MAX_TEST_PERIOD
  );

  test.skip(
    "should be able order products",
    async () => {
      const testUser = await User.findOne({name: user.name});
      products.forEach(product => {
        testUser.cart.push({
          productData: product.id,
          quantity: 1,
        });
      });
      await testUser.save();
      await page.openUrl(`${base}/cart`);
      await page.clickById("order-now");
      const title = await page.getTitle();
      expect(title).toEqual("Your Orders");
    },
    MAX_TEST_PERIOD
  );
});
