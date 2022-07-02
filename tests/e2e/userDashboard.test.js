const requires = require("../utils/requires");

const {
  startApp,
  closeApp,
  getNewDriverInstance,
  TEST_PORT,
} = require("./config");

const { clearDb } = require("../utils/generalUtils").database;

const {
  Page,
  session,
  utilLogin,
  generalUtils,
  ProductPage,
} = require("./utils");
const {
  ensureHasTitleAndInfo,
  ensureHasTitleAndError,
  clearModelsInProductTests,
  clearSessions,
} = require("./utils/generalUtils");
const { product, maxImageSize } = requires.constrains;

const { ensureHasTitle } = generalUtils;

const MAX_SETUP_TIME = 25000;
const MAX_TESTING_TIME = 20000;

const PORT = TEST_PORT;
const base = `http://localhost:${PORT}`;

const data = {
  name: "John Doe",
  email: "johndoe@email.com",
  password: "JDoe787@?",
};
const logInUrl = `${base}/auth/user/log-in`;
let page;

let user;

describe("User Dashboard operations ", () => {
  beforeAll(async () => {
    await startApp(PORT);
    page = new Page(getNewDriverInstance());
    user = await utilLogin(page, logInUrl, data, "user");
    await ensureHasTitle(page, "Your Products");
  }, MAX_SETUP_TIME);
  afterAll(async () => {
    await page.close();
    await clearDb();
    await clearSessions();
    await closeApp();
  });
  describe("Protected Activities", () => {
    describe("Add Product", () => {
      beforeEach(async () => {
        await page.openUrl(`${base}/admin/add-product`);
      }, MAX_SETUP_TIME);

      afterEach(clearModelsInProductTests);
      it(
        "should upload a product ",
        async () => {
          await enterProductData(validProduct);
          await ensureHasTitleAndInfo(
            page,
            "Your Products",
            "Product added successfully."
          );
          //ensure that produc is added to the database.
          await ensureProductExistUsingItsTitle(validProduct.title);
        },
        MAX_TESTING_TIME
      );
      let productData;
      let errorMessage;
      productData = { ...validProduct };
      productData.buyingPrice = "";
      errorMessage = "buyingPrice must be a number.";
      runinvalidFieldLengthTest(
        "reject if  data is missing",
        productData,
        errorMessage
      );

      runinvalidFieldLengthTest(
        "should refuse if the product data is incorrect ",
        invalidFieldLength,
        product.title.error
      );

      it(
        "should prompt an admin to enter an image if they had not select one.",
        async () => {
          const prodPage = new ProductPage(page);
          await prodPage.enterTitle(validProduct.title);
          await prodPage.enterBuyingPrice(validProduct.buyingPrice);
          await prodPage.enterPercentageProfit(validProduct.percentageProfit);
          await prodPage.enterQuantity(validProduct.quantity);
          await prodPage.enterBrand(validProduct.brand);
          await prodPage.enterCategory(validProduct.category);
          await prodPage.enterDescription(validProduct.description);
          await prodPage.submit();
          await ensureHasTitleAndError(
            page,
            "Add Product",
            `Please enter an image for your product.`
          );
          await ensureProductDoesNotExistUsingItsTitle(validProduct.title);
        },
        MAX_TESTING_TIME
      );

      it(
        "should refuse when an admin enters a larger image than the allowed size.",
        async () => {
          await enterProductData(veryLargeImage);
          await ensureHasTitleAndError(page, "Add Product", maxImageSize.error);
          await ensureProductDoesNotExistUsingItsTitle(validProduct.title);
        },
        MAX_TESTING_TIME
      );
      it(
        "should refuse when selected file is not an image.",
        async () => {
          await enterProductData(nonImage);
          await ensureHasTitleAndError(
            page,
            "Add Product",
            `Selected file is not an image! Select an image less than 2 MB in size.`
          );
          await ensureProductDoesNotExistUsingItsTitle(validProduct.title);
        },
        MAX_TESTING_TIME
      );

      function runinvalidFieldLengthTest(testMessage, product, errorMessage) {
        it(
          testMessage,
          async () => {
            await enterProductData(product);
            await ensureHasTitleAndError(page, "Add Product", errorMessage);
            //errernous products should not be added to the database.
            await ensureProductDoesNotExistUsingItsTitle(productData.title);
          },
          MAX_TESTING_TIME
        );
      }
    });
  });
});
