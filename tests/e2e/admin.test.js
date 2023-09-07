const path = require("path");

const requires = require("../utils/requires");

const { product, maxImageSize } = requires.constrains;

const { Product } = requires.Models;

const {
  startApp,
  closeApp,
  getNewDriverInstance,
  TEST_PORT,
} = require("./config");

const {
  deleteAllCreatedImages,
  generateRandomProductData,
  generatePerfectProductData,
  returnObjectWithoutProp,
  generateStringSizeN,
  PRODUCT_PROPERTIES,
} = require("../utils/generalUtils/utils");
const {
  verifyEqual,
  verifyTruthy,
  verifyFalsy,
  ensureValueGreateThan,
} = require("../utils/testsUtils");

const { clearDb, clearModel } = require("../utils/generalUtils").database;

const {
  Page,
  session,
  utilLogin,
  generalUtils,
  ProductPage,
} = require("./utils");

const {
  createTestProducts,
  createDocForType,
  createAdminSalesTestDataForAdminId,
  feedProductsWithTestCategories,
} = require("../utils/generalUtils/database");
const { By } = require("selenium-webdriver");
const { ensureObjectsHaveSameFields, ranges } = require("../models/utils");
const { PRODUCTS_PER_PAGE } = requires.envs;
const { checkIfExist } = requires.utils.cloudUploader;
const {
  ensureHasTitleAndInfo,
  ensureHasTitleAndError,
  clearModelsInProductTests,
  ensureHasTitle,
  clearSessions,
} = generalUtils;

const MAX_SETUP_TIME = 25000;
const MAX_TESTING_TIME = 20000;

const PORT = TEST_PORT;
const base = `http://localhost:${PORT}`;

const data = {
  name: "John Doe",
  email: "johndoe@email.com",
  password: "JDoe787@?",
};
const logInUrl = `${base}/auth/admin/log-in`;
let page;
const validProduct = {
  title: "test 1",
  file: path.resolve("tests/data/images/insert.jpg"),
  buyingPrice: 200.34,
  percentageProfit: 20,
  quantity: 200,
  brand: "The good Brand",
  category: "clothing",
  description: "The product was very good I  loved it.",
};

const veryLargeImage = { ...validProduct };
veryLargeImage.file = path.resolve("tests/data/images/too-large.jpg");

const invalidFieldLength = { ...validProduct };
invalidFieldLength.title = "te";

const correctUpdate = { ...validProduct };
correctUpdate.file = path.resolve("tests/data/images/update.jpg");

const nonImage = { ...validProduct };
nonImage.file = path.resolve("tests/data/images/non_image.pdf");

let admin;

const productsUrl = `${base}/admin/products`;
describe("Admin  ", () => {
  beforeAll(async () => {
    await startApp(PORT);
    page = new Page(getNewDriverInstance());
  }, MAX_SETUP_TIME);
  afterAll(async () => {
    await page.close();
    await clearDb();
    await clearSessions();
    await closeApp();
    await deleteAllCreatedImages();
  });

  describe("Add Product", () => {
    const url = `${base}/admin/add-product`;

    it(
      "should refuse when admin not logged in",
      async () => {
        await page.openUrl(url);
        await ensureHasTitleAndInfo(
          page,
          "Admin Log In",
          "Your are required to log in to continue"
        );
      },
      MAX_TESTING_TIME
    );

    describe("When Logged In", () => {
      beforeAll(async () => {
        await logIn();
      }, MAX_SETUP_TIME);

      afterAll(async () => {
        await clearSessions();
      });

      beforeEach(async () => {
        await page.openUrl(url);
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

  describe("Editing products", () => {
    it(
      "should refuse when admin not logged in",
      async () => {
        await page.openUrl(productsUrl);
        await ensureHasTitleAndInfo(
          page,
          "Admin Log In",
          "Your are required to log in to continue"
        );
      },
      MAX_TESTING_TIME
    );

    describe("When logged in", () => {
      beforeAll(async () => {
        await logIn();
      }, MAX_SETUP_TIME);

      afterAll(async () => {
        await clearSessions();
      });

      //TODO add to test to ensure that that editing comes with the previous data
      let created;
      beforeEach(async () => {
        created = (await createTestProducts([admin.id], 1))[0];
        await page.openUrl(productsUrl);
        await clickOneEdit();
      });
      afterEach(clearModelsInProductTests);
      it(
        "should update for correct data",
        async () => {
          await clearDb();
          await page.openUrl(`${base}/admin/add-product`);
          await enterProductData(validProduct);
          const firstOne = (await Product.find())[0];
          await page.openUrl(productsUrl);
          await clickOneEdit();
          await enterProductData(correctUpdate);
          await await ensureHasTitleAndInfo(
            page,
            "Your Products",
            "Product updated successfully."
          );
          const update = await findProductById(firstOne.id);
          ensureObjectsHaveSameFields(update, correctUpdate, [
            "title",
            "description",
          ]);
          //ensure that the previous image is deleted in the cloud since the seller
          //has changed the product picture.
          verifyFalsy(await checkIfExist(firstOne.public_id));
          //ensure that the current image exists in teh cloud.
          verifyTruthy(await checkIfExist(update.public_id));
        },
        MAX_TESTING_TIME
      );

      let productData;
      let errorMessage;
      productData = { ...validProduct };
      productData.buyingPrice = "";
      errorMessage = "buyingPrice must be a number.";
      runInvalidObjectDataTest(
        "reject if  data is missing",
        productData,
        errorMessage
      );

      runInvalidObjectDataTest(
        "should refuse if the product data is incorrect ",
        invalidFieldLength,
        product.title.error
      );

      it(
        "should refuse when an admin enters a larger image than the allowed size.",
        async () => {
          await enterProductData(veryLargeImage);
          await ensureHasTitleAndError(
            page,
            "Edit Product",
            maxImageSize.error
          );
          await ensureProductNotChanged();
        },
        MAX_TESTING_TIME
      );
      it(
        "should refuse when selected file is not an image.",
        async () => {
          await enterProductData(nonImage);
          await ensureHasTitleAndError(
            page,
            "Edit Product",
            `Selected file is not an image! Select an image less than 2 MB in size.`
          );
          await ensureProductNotChanged();
        },
        MAX_TESTING_TIME
      );

      function runInvalidObjectDataTest(testMessage, product, errorMessage) {
        it(
          testMessage,
          async () => {
            await enterProductData(product);
            await ensureHasTitleAndError(page, "Edit Product", errorMessage);
            await ensureProductNotChanged();
          },
          MAX_TESTING_TIME
        );
      }

      async function ensureProductNotChanged() {
        //don't check of admin Id similarity.
        const fields = Object.keys(PRODUCT_PROPERTIES).filter(
          (value, index) => {
            return value !== "adminId";
          }
        );
        const update = await findProductById(created.id);
        ensureObjectsHaveSameFields(update, created, fields);
      }
    });
  });

  describe("should be able to delete products", () => {
    it(
      "should refuse when admin not logged in",
      async () => {
        await page.openUrl(productsUrl);
        await ensureHasTitleAndInfo(
          page,
          "Admin Log In",
          "Your are required to log in to continue"
        );
      },
      MAX_TESTING_TIME
    );
    describe("When logged in", () => {
      beforeAll(async () => {
        await logIn();
      }, MAX_SETUP_TIME);

      afterAll(async () => {
        await clearSessions();
      });

      //TODO add to test to ensure that that editing comes with the previous data
      let created;
      beforeEach(async () => {
        await page.openUrl(`${base}/admin/add-product`);
        await enterProductData(validProduct);
        await page.hold(5000);
        await clickOneEdit();
      }, MAX_SETUP_TIME);
      afterEach(clearModelsInProductTests);

      it(
        "should be able to delete products without reloading ",
        async () => {
          const noOfProducts = 2;
          await await page.openUrl(productsUrl);
          await clickOneDelete();

          const articles = await page.getELements("article");
          await page.hold(200);
          //ensure that the product is removed without reloading.
          verifyEqual(articles.length, 1);

          //ensure real deletion in the database.
          const noOfDocs = await Product.find().countDocuments();
          verifyEqual(noOfDocs, noOfProducts - 1);
        },
        MAX_TESTING_TIME
      );

      it(
        "should ensure user is informed after reloading",
        async () => {
          const noOfProducts = 2;
          await createTestProducts([admin.id], noOfProducts);
          await page.openUrl(productsUrl);
          await clickOneDelete();
          await page.hold(500);
          await ensureHasTitleAndInfo(
            page,
            "Your Products",
            "Product deleted successfully."
          );
        },
        MAX_TESTING_TIME
      );

      it(
        "should ensure that the product image is also deleted in the cloud",
        async () => {
          //erase data created by the beforeEach.
          await clearDb();
          await page.openUrl(`${base}/admin/add-product`);
          await enterProductData(validProduct);
          const firstOne = (await Product.find())[0];
          await page.openUrl(productsUrl);
          await clickOneDelete();
          await page.hold(300);
          verifyFalsy(await checkIfExist(firstOne.public_id));
        },
        MAX_TESTING_TIME
      );
    });
  });

  describe("Should be able to click links", () => {
    let products;
    const productsUrl = `${base}/admin/products`;
    beforeEach(async () => {
      products = await createTestProducts([admin.id], 3);
      await page.openUrl(productsUrl);
    });
    afterEach(clearModelsInProductTests);
    describe("Category navigation", () => {
      it(
        "should click category links",
        async () => {
          const category = "category 1";
          await clearModelsInProductTests();
          const product = { ...validProduct };
          product.category = category;
          product.adminId = admin.id;
          product.imageUrl = "some/path/to/some/image.jpg";
          await Product.createOne(product);

          //reload incase the there are errors.
          await page.openUrl(productsUrl);
          await page.hold(200);
          await page.clickLink(category);
          const title = await page.getTitle();
          expect(title).toEqual(category);
        },
        MAX_TESTING_TIME
      );

      it(
        "should click a pagination for a category ",
        async () => {
          const categories = ["category 1", "category 2"];
          await clearModelsInProductTests();
          for (const category of categories) {
            for (let i = 0; i < PRODUCTS_PER_PAGE * 1.5; i++) {
              const product = { ...validProduct };
              product.category = category;
              product.adminId = admin.id;
              product.imageUrl = "some/path/to/some/image.jpg";
              await Product.createOne(product);
            }
          }

          for (const category of categories) {
            //reload incase the there are errors.
            await page.openUrl(productsUrl);
            await page.clickLink(category);
            await page.clickLink("2");
            const title = await page.getTitle();
            expect(title).toEqual(category);
            let articles = await page.getELements("article");
            verifyEqual(articles.length, PRODUCTS_PER_PAGE * 0.5);
          }
        },
        MAX_TESTING_TIME
      );

      it(
        "should refuse when category is out of range",
        async () => {
          const categoryRange = ranges.product.category;
          await page.openUrl(
            `${base}/admin/category/${generateStringSizeN(
              categoryRange.maxlength + 1
            )}/?page=1`
          );
          await ensureHasTitleAndError(
            page,
            "Your Products",
            categoryRange.error
          );
        },
        MAX_TESTING_TIME
      );
      it(
        "should refuse when page is out of range",
        async () => {
          const categoryRange = ranges.product.category;
          await page.openUrl(
            `${base}/admin/category/${generateStringSizeN(
              categoryRange.maxlength
            )}?page=${ranges.shop.page.max + 1}`
          );
          await ensureHasTitleAndError(
            page,
            "Your Products",
            ranges.shop.page.error
          );
        },
        MAX_TESTING_TIME
      );
    });

    //Tests for checking that products are rendered are left out.
    //When the products are not there, the test will fail since there will be
    //nothing to select.
    it(
      "should click a pagination link ",
      async () => {
        await clearDb();
        await createTestProducts([admin.id], PRODUCTS_PER_PAGE * 1.5);
        await page.clickLink("1");
        let articles = await page.getELements("article");
        verifyEqual(articles.length, PRODUCTS_PER_PAGE);
        await page.clickLink("2");
        articles = await page.getELements("article");
        verifyEqual(articles.length, PRODUCTS_PER_PAGE * 0.5);
      },
      MAX_TESTING_TIME
    );
  });

  describe("View Sales", () => {
    const url = `${base}/admin/get-admin-sales`;

    it(
      "should refuse when admin not logged in",
      async () => {
        await page.openUrl(url);
        await ensureHasTitleAndInfo(
          page,
          "Admin Log In",
          "Your are required to log in to continue"
        );
      },
      MAX_TESTING_TIME
    );

    describe("When Logged In", () => {
      beforeAll(async () => {
        await logIn();
      }, MAX_SETUP_TIME);

      afterAll(async () => {
        await clearSessions();
      });

      beforeEach(async () => {
        await page.openUrl(url);
      }, MAX_SETUP_TIME);

      afterEach(clearModelsInProductTests);

      it(
        "Should be able to see  their sales",
        async () => {
          const testTitle = "title 1";
          let productData = generatePerfectProductData();
          productData.title = testTitle;
          await createAdminSalesTestDataForAdminId(admin.id, [
            await Product.createOne(productData),
          ]);
          await page.openUrl(`${base}/admin/get-admin-sales`);

          await page.hold(5000);
          const articles = await page.getELements("article");
          const firstArticle = articles[0];

          //ensure title is rendered.
          const text = await firstArticle
            .findElement(By.className("card__header"))
            .getText();
          //the test data contains the word 'title'
          ensureValueGreateThan(text.length, ranges.product.title.minlength);

          //ensure both the total and the profit are rendered .
          const salesDataSections = await firstArticle.findElement(
            By.className("card__content")
          );
          const paragraphs = await salesDataSections.findElements(By.css("p"));
          const profit = await paragraphs[0].getText();
          const total = await paragraphs[1].getText();
          const currencyIndicator = "Kshs ";
          verifyTruthy(
            profit.indexOf(currencyIndicator) == 0 &&
              total.indexOf(currencyIndicator) == 0
          );
        },
        MAX_TESTING_TIME
      );
    });
  });

  async function logIn() {
    admin = await utilLogin(page, logInUrl, data, "admin");
    await ensureHasTitle(page, "Your Products");
  }

  async function enterProductData(product) {
    const prodPage = new ProductPage(page);
    await prodPage.enterTitle(product.title);
    await prodPage.chooseFIle(product.file);
    await prodPage.enterBuyingPrice(product.buyingPrice);
    await prodPage.enterPercentageProfit(product.percentageProfit);
    await prodPage.enterQuantity(product.quantity);
    await prodPage.enterBrand(product.brand);
    await prodPage.enterCategory(product.category);
    await prodPage.enterDescription(product.description);
    await prodPage.submit();
  }
  async function clickOneEdit() {
    const articles = await page.getELements("article");
    await articles[0].findElement(By.className(`edit_product`)).click();
  }
  async function clickOneDelete() {
    const articles = await page.getELements("article");
    await articles[0].findElement(By.className("delete")).click();
  }
});

async function ensureProductExistUsingItsTitle(title) {
  const product = await findProductByTitle(title);
  expect(product).not.toBeNull();
  //ensure that the image exists in the cloud.
  verifyTruthy(await checkIfExist(product.public_id));
}
async function ensureProductDoesNotExistUsingItsTitle(title) {
  const product = await findProductByTitle(title);
  expect(product).toBeNull();
}
async function findProductByTitle(title) {
  return await Product.findOne({ title });
}

async function findProductById(id) {
  return await Product.findById(id);
}
