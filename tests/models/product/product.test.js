const {Product} = require("../../../database/models/index");

const TRIALS = 10;

const {
  verifyIDsAreEqual,
  verifyEqual,
  verifyTruthy,
  verifyFalsy,
} = require("../../utils/testsUtils");

const {connectToDb, closeConnectionToBd} = require("../../config");
const {
  getRandomProductData,
  clearTheDb,
  createTestProducts,
  generateMongooseId,
} = require("../../utils/generalUtils");

const {
  verifyErrorIsThrownWhenAnyProductDataMisses,
  hasWellCalculatedSellingPrice,
  calculatePaginationData,
  ensureNoOfProductsAreWithinPRODUCTS_PER_PAGE,
  ensureProductsHavePositiveQuantity,
  feedProductsWithTestCategories,
  getRandomProductDataWithNoImageUrl,
} = require("./util");

const adminId = generateMongooseId();

describe("--Product ", () => {
  beforeAll(async () => {
    await connectToDb();
  });
  afterAll(async () => {
    await closeConnectionToBd();
  });
  let product;
  afterEach(async () => {
    await clearTheDb();
  });
  it("createOne create a complete product with sellingPrice added to it", async () => {
    const productData = getRandomProductData(adminId);
    //the productData has sellingPrice added to it by createNew.so we need to
    //copy(by destructuring) it so that we can maintain its previous properties.
    const productCopy = {...productData};
    product = await Product.createOne(productData);
    // see that the previous properties are captured in the created product
    for (const key in productCopy) {
      if (key == "adminId") {
        verifyIDsAreEqual(productCopy[key], adminId);
        continue;
      }
      verifyEqual(product[key], productData[key]);
    }
    verifyTruthy(hasWellCalculatedSellingPrice(product));
    //need the adminId since we are also creating random product data
    //in this function.
    verifyErrorIsThrownWhenAnyProductDataMisses(adminId);
  });
  describe("After Creation", () => {
    let products = [];
    describe("Static Methods", () => {
      beforeEach(async () => {
        products = await createTestProducts(adminId, TRIALS);
      });
      it(`findProductsForPage get present products and the pagination Data for a page`, async () => {
        const page = 2;
        const renderData = await Product.findProductsForPage(page);
        const paginationData = await calculatePaginationData(page);
        const renderedProducts = renderData.products;
        ensureNoOfProductsAreWithinPRODUCTS_PER_PAGE(renderedProducts);
        ensureProductsHavePositiveQuantity(renderedProducts);
        verifyEqual(renderData.paginationData, paginationData);
      });

      it(`findCategories() return the number of categories for all the products`, async () => {
        const expectedCategories = ["category 1", "category 2", "category 3"];
        await feedProductsWithTestCategories(products, expectedCategories);
        const categories = await Product.findCategories();
        verifyEqual(categories, expectedCategories);
      });
      it(`findCategoryProductsForPage returns products with a certain category`, async () => {
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
      });
      it(`findPageProductsForAdminId get number of products(with positive quantity) and the 
          pagination Data for an admin for  a page`, async () => {
        const page = 2;
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
      });
    });
    describe("instance methods", () => {
      let product;
      beforeEach(async () => {
        product = (await createTestProducts(adminId, 1))[0];
      });
      it(` isCreatedByAdminId returns true if the adminId created a product and false otherwise`, async () => {
        const trialAdminId = "ID2343949949994";
        verifyTruthy(product.isCreatedByAdminId(adminId));
        verifyFalsy(product.isCreatedByAdminId(trialAdminId));
      });

      it(`incrementQuantity increases a product quantity`, async () => {
        let initial, final, increment;
        initial = 50;
        increment = 89;
        final = initial + increment;
        product.quantity = initial;
        await product.save();
        await product.incrementQuantity(increment);
        verifyEqual(product.quantity, final);
      });
      it(`decrementQuantity reduces a product quantity`, async () => {
        let initial, final, decrement;
        initial = 100;
        decrement = 45;
        final = initial - decrement;
        product.quantity = initial;
        await product.save();
        await product.decrementQuantity(decrement);
        verifyEqual(product.quantity, final);
      });
      describe(`updateDetails updates product's details`, () => {
        it("When the product image is changed.", async () => {
          const data = getRandomProductData(adminId);
          //we need to copy since updataDetails adds sellingPrice data.
          //we will test sellingPrice separately.
          let dataCopy = {...data};
          await product.updateDetails(data);
          for (const key in dataCopy) {
            if (dataCopy.hasOwnProperty(key))
              if (key === "adminId") {
                verifyIDsAreEqual(dataCopy[key], adminId);
                continue;
              }
            verifyEqual(dataCopy[key], product[key]);
          }
          verifyTruthy(hasWellCalculatedSellingPrice(product));
        });
        it("When the product image is not changed.(image not provided).", async () => {
          const previousImageUrl = product.imageUrl;
          const data = getRandomProductDataWithNoImageUrl(adminId);
          //we need to copy since updataDetails adds sellingPrice data.
          //we will test sellingPrice separately.
          let dataCopy = {...data};
          await product.updateDetails(data);
          for (const key in dataCopy) {
            if (dataCopy.hasOwnProperty(key))
              if (key === "adminId") {
                verifyIDsAreEqual(dataCopy[key], adminId);
                continue;
              }
            verifyEqual(dataCopy[key], product[key]);
          }
          verifyTruthy(hasWellCalculatedSellingPrice(product));
          //ensure previous Image is not changed.
          verifyEqual(previousImageUrl, product.imageUrl);
        });
      });
      it("deleteProduct() deletes current product", async () => {
        const productId = product.id;
        await product.deleteProduct();
        const foundProduct = await Product.findById(productId);
        expect(foundProduct).toBeNull();
      });
    });
  });
});
