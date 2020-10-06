const {throws} = require("assert");

const {Product} = require("../../../database/models/index");

const TRIALS = 100;

const {
  verifyIDs,
  verifyDeeplyEqual,
  verifyTruthy,
  verifyFalsy,
} = require("../../utils/testUtils");

const {connectToDb, closeConnectionToBd} = require("../../config");
const {
  getRandomProductData,
  createTestProducts,
  createNewAdmin,
  deleteAdminById,
  deleteAllProducts,
  clearDataFromAModel,
} = require("../../utils/generalUtils");

const {
  setTRIAL,
  setAdminId,
  setProducts,
  createNewProduct,
  getRandomProductDataWithoutADataItem,
  hasWellCalculatedSellingPrice,
  calculatePaginationData,
  ensureThatTheRenderProductsAreWithinMAX_PRODUCT_PER_PAGE,
  ensureAllRenderedProductsHavePositiveQuantity,
  feedProductsWithTestCategories,
  testProductUpdation,
  getRandomProductDataWithNoImageUrl,
} = require("./products");

let admin;

setTRIAL(TRIALS);
describe("--Product ", () => {
  beforeAll(async () => {
    await connectToDb();
    admin = await createNewAdmin();
    setAdminId(admin.id);
  });
  afterAll(async () => {
    await deleteAdminById(admin.id);
    await closeConnectionToBd();
  });
  it("createNew create a complete product with sellingPrice added to it", async () => {
    const productData = getRandomProductData(admin.id);
    //the productData has sellingPrice added to it by createNew.so we need to
    //copy(by destructuring) it so that we can maintain its previous properties.
    const productCopy = {...productData};
    const product = await Product.createNew(productData);

    // see that the previous properties are captured in the created product
    for (const key in productCopy) {
      if (key == "adminId") {
        verifyIDs(productCopy[key], admin.id);
        continue;
      }
      verifyDeeplyEqual(product[key], productData[key]);
    }

    verifyTruthy(hasWellCalculatedSellingPrice(product));
    let message;
    for (const key in productCopy) {
      {
        message = `${key} is expected`;
        const trial = getRandomProductDataWithoutADataItem("buyingPrice");
        Product.createNew(trial);
        // throws(
        //   () => {
        //     Product.createNew(trial).catch((err) => {
        //       throw new Error(err);
        //     });
        //   },
        //   {message}
        // );
      }
    }

    await Product.findByIdAndDelete(product.id);
  });
  describe("After Creation", () => {
    let products = [];
    describe("Static Methods", () => {
      beforeEach(async () => {
        //incase previous test failed before deleting the data they created.
        await clearDataFromAModel(Product);
        products = await createTestProducts(admin.id, TRIALS);
        setProducts(products);
      });
      afterEach(async () => {
        await deleteAllProducts(products);
      });
      it(`getProductsWhoseQuantityIsGreaterThanZero get present products and the pagination Data for a page`, async () => {
        const page = 2;
        const renderData = await Product.getProductsWhoseQuantityIsGreaterThanZero(page);
        const paginationData = await calculatePaginationData(page);
        const renderedProducts = renderData.products;
        //ensure that renderedProducts are within the limits.
        ensureThatTheRenderProductsAreWithinMAX_PRODUCT_PER_PAGE(renderedProducts);
        //ensure all rendered products have positive quantity.
        ensureAllRenderedProductsHavePositiveQuantity(renderedProducts);
        verifyDeeplyEqual(renderData.paginationData, paginationData);
      });

      it(`findPageProductsForAdminId get number of products(with positive quantity) and the pagination Data for an admin for  a page`, async () => {
        const adminId = admin.id;
        const page = 2;
        const renderData = await Product.findPageProductsForAdminId(adminId, page);
        //we present everything that is created by the current admin even if the quantity is less than
        //zero.
        const createdByPresentAdminId = {adminId};
        const paginationData = await calculatePaginationData(
          page,
          createdByPresentAdminId
        );

        const renderedProducts = renderData.products;
        const numberOfRenderedProducts = renderedProducts.length;

        //ensure that all the renderedProducts have the adminId as their creator.
        for (let index = 0; index < numberOfRenderedProducts; index++) {
          verifyIDs(renderedProducts[index].adminId, adminId);
        }
        ensureAllRenderedProductsHavePositiveQuantity(renderedProducts);
        ensureThatTheRenderProductsAreWithinMAX_PRODUCT_PER_PAGE(renderedProducts);
        verifyDeeplyEqual(renderData.paginationData, paginationData);
      });

      it(`getPresentCategories return the number of categories for all the products`, async () => {
        const expectedCategories = ["category 1", "category 2", "category 3"];
        await feedProductsWithTestCategories(expectedCategories);
        const categories = await Product.getPresentCategories();
        verifyDeeplyEqual(categories, expectedCategories);
      });
      it(`findCategoryProducts returns products with a certain category`, async () => {
        const expectedCategories = ["category 1", "category 2", "category 3"];
        const page = 1;
        await feedProductsWithTestCategories(expectedCategories);
        expectedCategories.forEach(async (category) => {
          const renderData = await Product.findCategoryProducts(category, page);
          const {paginationData, products} = renderData;
          products.forEach((element) => {
            verifyDeeplyEqual(element.category, category);
          });
          ensureAllRenderedProductsHavePositiveQuantity(products);

          verifyDeeplyEqual(
            await calculatePaginationData(page, {
              category,
            }),
            paginationData
          );
        });
      });
    });
    describe("instance methods", () => {
      let product;
      beforeEach(async () => {
        //incase previous tests failed before deleting the data they created.
        await clearDataFromAModel(Product);
        product = await createNewProduct(admin.id);
      });
      afterEach(async () => {
        await Product.findByIdAndDelete(product.id);
      });

      it(` isCreatedByAdminId returns true if the adminId created a product and false otherwise`, async () => {
        const trialAdminId = "ID2343949949994";
        verifyTruthy(product.isCreatedByAdminId(admin.id));
        verifyFalsy(product.isCreatedByAdminId(trialAdminId));

        //delete this product independently. since the afterEach delete function will delete the product we are about to
        //create next.
        await Product.findByIdAndDelete(product.id);

        //create a new product with  the trial Admin.
        product = await createNewProduct(trialAdminId);
        verifyFalsy(product.isCreatedByAdminId(admin.id));
        verifyTruthy(product.isCreatedByAdminId(trialAdminId));
      });

      it(` increaseQuantityBy increases a product quantity`, async () => {
        let initial, final, increment;
        initial = 50;
        increment = 89;
        final = initial + increment;
        product.quantity = initial;
        await product.save();
        await product.increaseQuantityBy(increment);
        verifyDeeplyEqual(product.quantity, final);
      });
      it(` reduceQuantityBy reduces a product quantity`, async () => {
        let initial, final, decrement;
        initial = 100;
        decrement = 45;
        final = initial - decrement;
        product.quantity = initial;
        await product.save();
        await product.reduceQuantityBy(decrement);
        verifyDeeplyEqual(product.quantity, final);
      });
      describe(`updateDetails updates product's details`, () => {
        it("When the product image is changed.", async () => {
          const testProductData = getRandomProductData(admin.id);
          await testProductUpdation(product, testProductData);
        });
        it("When the product image is not changed.(image not provided).", async () => {
          const testProductData = getRandomProductDataWithNoImageUrl(admin.id);
          const previousImageUrl = product.imageUrl;
          await testProductUpdation(product, testProductData);
          verifyDeeplyEqual(previousImageUrl, product.imageUrl);
        });
      });
    });
  });
});
