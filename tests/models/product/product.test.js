const {Product} = require("../../../database/models/index");

const NUMBER_OF_TRIAL_PRODUCTS = 100;

const MAX_TESTING_TIME_IN_MS = 200000;

const RATIO_OF_ADMINS_TO_PRODUCTS = 0.1;
const {
  verifyIDsAreEqual,
  verifyEqual,
  verifyTruthy,
  verifyFalsy,
  verifyNull,
} = require("../../utils/testsUtils");

const {includeSetUpAndTearDown} = require("../utils");
const {
  getRandomProductData,
  clearTheDb,
  createTrialAdmins,
  createTestProducts,
  generateRandomMongooseIds,
} = require("../../utils/generalUtils");

const {
  fetchAdminIdsFromAdmins,
  verifyProductHasProperties,
  verifyErrorIsThrownWhenAnyProductDataMissesOrIsOutOfRange,
  calculatePaginationData,
  ensureNoOfProductsAreWithinPRODUCTS_PER_PAGE,
  ensureProductsHavePositiveQuantity,
  feedProductsWithTestCategories,
  getRandomProductDataWithNoImageUrl,
} = require("./util");

describe.skip("--Product ", () => {
  includeSetUpAndTearDown();
  let admins = [],
    products = [],
    adminIds = [];

  it("createOne create a complete product with sellingPrice added to it", async () => {
    let product = [];
    const adminId = generateRandomMongooseIds(1)[0];
    const productData = getRandomProductData(adminId);
    product = await Product.createOne(productData);
    verifyProductHasProperties(product, productData);
    await expect(Product.createOne({})).rejects.toThrow("Invalid Object.");
    await verifyErrorIsThrownWhenAnyProductDataMissesOrIsOutOfRange(adminId);
  });
  describe("After Creation", () => {
    describe("Static Methods", () => {
      beforeAll(async () => {
        await clearTheDb();
        admins = await createTrialAdmins(
          Math.floor(NUMBER_OF_TRIAL_PRODUCTS * RATIO_OF_ADMINS_TO_PRODUCTS)
        );

        adminIds = fetchAdminIdsFromAdmins(admins);
        products = await createTestProducts(adminIds, NUMBER_OF_TRIAL_PRODUCTS);
      }, MAX_TESTING_TIME_IN_MS);

      afterAll(async () => {
        await clearTheDb();
      }, MAX_TESTING_TIME_IN_MS);

      it(
        `findProductsForPage get present products and the 
         pagination Data for a page`,
        async () => {
          const page = 2;
          const renderData = await Product.findProductsForPage(page);
          const paginationData = await calculatePaginationData(page);
          const renderedProducts = renderData.products;
          ensureNoOfProductsAreWithinPRODUCTS_PER_PAGE(renderedProducts);
          ensureProductsHavePositiveQuantity(renderedProducts);
          verifyEqual(renderData.paginationData, paginationData);
        },
        MAX_TESTING_TIME_IN_MS
      );

      it(
        `findCategories() return the number of categories 
         for all the products`,
        async () => {
          const expectedCategories = ["category 1", "category 2", "category 3"];
          await feedProductsWithTestCategories(products, expectedCategories);
          const categories = await Product.findCategories();
          verifyEqual(categories, expectedCategories);
        },
        MAX_TESTING_TIME_IN_MS
      );
      it(
        `findCategoryProductsForPage returns products with a 
         certain category`,
        async () => {
          const expectedCategories = [
            "category 1",
            "category 2",
            "category 3",
            "category 4",
          ];
          const page = 1;
          await feedProductsWithTestCategories(products, expectedCategories);
          //would have used a forEach method but it seems to have problems with async functions.
          for (let index = 0; index < expectedCategories.length; index++) {
            const category = expectedCategories[index];
            const renderData = await Product.findCategoryProductsForPage(
              category,
              page
            );
            const {paginationData, products} = renderData;
            products.forEach(element => {
              verifyEqual(element.category, category);
            });
            ensureProductsHavePositiveQuantity(products);
            const receivedPaginationData = await calculatePaginationData(page, {
              category,
            });
            verifyEqual(receivedPaginationData, paginationData);
          }
        },
        MAX_TESTING_TIME_IN_MS
      );
      it(
        `findPageProductsForAdminId get number of products(with positive quantity)
         and the pagination Data for an admin for  a page`,
        async () => {
          const page = 1;
          for (const adminId of adminIds) {
            const renderData = await Product.findPageProductsForAdminId(
              adminId,
              page
            );
            const createdByPresentAdminId = {adminId};
            const paginationData = await calculatePaginationData(
              page,
              createdByPresentAdminId
            );

            const renderedProducts = renderData.products;
            const numberOfRenderedProducts = renderedProducts.length;
            //ensure that all the renderedProducts have the adminId as their creator.
            for (let index = 0; index < numberOfRenderedProducts; index++) {
              verifyIDsAreEqual(renderedProducts[index].adminId, adminId);
            }
            ensureProductsHavePositiveQuantity(renderedProducts);
            ensureNoOfProductsAreWithinPRODUCTS_PER_PAGE(renderedProducts);
            verifyEqual(renderData.paginationData, paginationData);
          }
        },
        MAX_TESTING_TIME_IN_MS
      );
    });
    describe("instance methods", () => {
      let product;
      let adminId;
      beforeEach(async () => {
        product = (await createTestProducts(adminIds, 1))[0];
        adminId = adminIds[0];
      });
      afterEach(async () => {
        await clearTheDb();
      });
      it(`isCreatedByAdminId returns true if the adminId created a product and false otherwise`, async () => {
        const trialAdminId = generateRandomMongooseIds(1)[0];
        verifyTruthy(product.isCreatedByAdminId(adminId));
        verifyFalsy(product.isCreatedByAdminId(trialAdminId));
      });

      it(`incrementQuantity increases a product quantity`, async () => {
        let initial, final, increment;
        initial = 20;
        await setQuantityTo(initial);
        increment = 89;
        final = initial + increment;
        await product.incrementQuantity(increment);
        verifyEqual(product.quantity, final);
        await rejectsIfIncrementsNegatives();
      });
      it(`decrementQuantity reduces a product quantity`, async () => {
        let initial, final, decrement;
        initial = 400;
        await setQuantityTo(initial);
        decrement = 100;
        final = initial - decrement;
        await product.decrementQuantity(decrement);
        verifyEqual(product.quantity, final);
        await rejectsIfDecemenetMakesQuantityNonPositive();
      });
      describe(`updateDetails updates product's details`, () => {
        it("When the product image is changed.", async () => {
          const data = getRandomProductData(adminId);
          await product.updateDetails(data);
          verifyProductHasProperties(product, data);
        });
        it("When the product image is not changed.(image not provided).", async () => {
          const previousImageUrl = product.imageUrl;
          const data = getRandomProductDataWithNoImageUrl(adminId);
          await product.updateDetails(data);
          verifyProductHasProperties(product, data);
          verifyEqual(previousImageUrl, product.imageUrl);
        });
      });
      it("deleteProduct() deletes current product", async () => {
        const productId = product.id;
        await product.deleteProduct();
        const foundProduct = await Product.findById(productId);
        verifyNull(foundProduct);
      });

      async function setQuantityTo(quantity) {
        product.quantity = quantity;
        await product.save();
      }

      const rejectsIfIncrementsNegatives = async () => {
        const errorMessage = "Value must be positive integer.";
        let increment = 0;
        await expect(product.incrementQuantity(increment)).rejects.toThrow(
          errorMessage
        );
        increment = -1;
        await expect(product.incrementQuantity(increment)).rejects.toThrow(
          errorMessage
        );
      };
      const rejectsIfDecemenetMakesQuantityNonPositive = async () => {
        let decrement, initial;
        initial = 400;
        await setQuantityTo(initial);
        decrement = initial + 1;
        await expect(product.decrementQuantity(decrement)).rejects.toThrow(
          "No Enough Money to decrement."
        );
      };
    });
  });
});
