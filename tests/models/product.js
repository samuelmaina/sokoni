const { throws } = require("assert");

require("dotenv").config();

const { Admin, Product } = require("../../database/models/index");

const { connectToDb, closeConnectionToBd } = require("../config");
const {
  createNewAdmin,
  deleteAdmin,
  createTestProducts,
  deleteAllProducts,
  calculatePaginationData,
} = require("../utils");

const PRODUCTS_PER_PAGE = parseInt(process.env.PRODUCTS_PER_PAGE);

describe("--Product ", () => {
  beforeEach(async () => {
    await connectToDb();
  });
  afterEach(async () => {
    await closeConnectionToBd();
  });
  it("createNew create a complete product with sellingPrice added to it", async () => {
    const admin = await createNewAdmin();
    const productData = {
      title: ` test ${Math.floor(Math.random() * 100)}`.trim(),
      imageUrl: `to/some/image${Math.floor(Math.random() * 100)}`,
      buyingPrice: Math.floor(Math.random() * 100),
      percentageProfit: Math.floor(Math.random() * 100),
      expirationPeriod: Math.floor(Math.random() * 100),
      description: `the first user test at  ${Math.floor(
        Math.random() * 100
      )} `.trim(),
      quantity: Math.floor(Math.random() * 100),
      adminId: admin._id,
      category: `category ${Math.floor(Math.random() * 100)}`.trim(),
      brand: `brand ${Math.floor(Math.random() * 100)}`.trim(),
    };
    await deleteAdmin(admin.id);
    const productCopy = { ...productData };
    const product = await Product.createNew(productData);
    await Product.findByIdAndDelete(product.id);

    // see that the previous properties are captured in the created product
    for (const key in productCopy) {
      //for mongoose Ids we need to convert them into strings for
      //proper comparison.
      if (key == "adminId") {
        expect(productData[key].toString()).toEqual(product[key].toString());
        continue;
      }
      expect(productData[key]).toEqual(product[key]);
    }

    let hasSellingPricePropAndIsWellCalculated = false;
    for (const key in product) {
      if (key === "sellingPrice") {
        const sellingPrice = product[key];
        const percentageProfit = product["percentageProfit"];
        const buyingPrice = product["buyingPrice"];
        if (((100 + percentageProfit) / 100) * buyingPrice === sellingPrice)
          hasSellingPricePropAndIsWellCalculated = true;
      }
    }
    const key = "buyingPrice";
    const incompleteProdData = {
      title: ` test ${Math.floor(Math.random() * 100)}`.trim(),
      imageUrl: `to/some/image${Math.floor(Math.random() * 100)}`,
      percentageProfit: Math.floor(Math.random() * 100),
      expirationPeriod: Math.floor(Math.random() * 100),
      description: `the first user test at  ${Math.floor(
        Math.random() * 100
      )} `.trim(),
      quantity: Math.floor(Math.random() * 100),
      adminId: admin._id,
      category: `category ${Math.floor(Math.random() * 100)}`.trim(),
      brand: `brand ${Math.floor(Math.random() * 100)}`.trim(),
    };
    throws(() => {
      Product.createNew(incompleteProdData).catch((err) => {
        throw new Error(err);
      });
    }, new Error(`${key} is expected`));
  });
  describe("Action After Creation", () => {
    let admin;
    let products = [];
    const trials = 10;
    beforeEach(async () => {
      admin = await createNewAdmin();
      products = await createTestProducts(admin.id, trials);
    });
    afterEach(async () => {
      await deleteAdmin(admin.id);
      await deleteAllProducts(products);
    });
    describe("Static Methods", () => {
      it(`getTotalNumberOfProducts get number of products(with positive quantity) with certain property`, async () => {
        const category = "category 1";
        //reset the categories
        for (let index = 0; index < trials; index++) {
          products[index].category = "yuyuyu";
          await products[index].save();
        }
        //feed some products with the properties
        for (let index = 0; index < trials; index++) {
          products[index].category = category;
          await products[index].save();
        }

        for (let index = 3; index < trials; index++) {
          products[index].quantity = 3;
          await products[index].save();
        }
        const trial = { category };
        const propertyProducts = await Product.getTotalNumberOfProducts(trial);
        expect(propertyProducts).toEqual(trials);
        const invalidTrial = { userId: "7885445454" };
        throws(() => {
          Product.getTotalNumberOfProducts(invalidTrial).catch((err) => {
            throw new Error(err);
          }),
            new Error("can not query a non-existent property");
        });
      });
      it(`getProductsWhoseQuantityIsGreaterThanZero get present products and the pagination Data for a page`, async () => {
        const page = 2;
        const renderData = await Product.getProductsWhoseQuantityIsGreaterThanZero(
          page
        );
        const quantityGreaterThanZero = { quantity: { $gt: 0 } };

        const total = await Product.find(
          quantityGreaterThanZero
        ).countDocuments();
        const paginationData = calculatePaginationData(page, total);
        expect(renderData.products.length).toEqual(PRODUCTS_PER_PAGE);
        expect(renderData.paginationData).toEqual(paginationData);
      });

      it(`findPageProductsForAdminId get number of products(with positive quantity) and the pagination Data for an admin for  a page`, async () => {
        const adminId = admin.id;
        const page = 2;
        const renderData = await Product.findPageProductsForAdminId(
          adminId,
          page
        );

        //we present everything that is created by the current admin even if the quantity is less than
        //zero.
        const createdByPresentAdminId = { adminId };
        const total = await Product.find(
          createdByPresentAdminId
        ).countDocuments();
        const paginationData = calculatePaginationData(page, total);
        const renderedProducts = renderData.products;
        const numberOfRenderedProducts = renderedProducts.length;
        expect(numberOfRenderedProducts).toEqual(PRODUCTS_PER_PAGE);
        expect(renderData.paginationData).toEqual(paginationData);
        for (let index = 0; index < numberOfRenderedProducts; index++) {
          expect(renderedProducts[index].adminId.toString()).toEqual(
            adminId.toString()
          );
        }
      });

      it(`getPresentCategories return the number of categories for all the products`, async () => {
        const expectedCategories = ["category 1", "category 2", "category 3"];
        for (let index = 0; index < 3; index++) {
          products[index].category = expectedCategories[0];
          await products[index].save();
        }
        for (let index = 3; index < 7; index++) {
          products[index].category = expectedCategories[1];
          await products[index].save();
        }
        for (let index = 7; index < trials; index++) {
          products[index].category = expectedCategories[2];
          await products[index].save();
        }
        const categories = await Product.getPresentCategories();

        expect(categories).toEqual(expectedCategories);
      });

      it(`findCategoryProducts returns products with a certain category`, async () => {
        const categories = ["category 1", "category 2", "category 3"];

        for (let index = 0; index < 3; index++) {
          products[index].category = categories[0];
          await products[index].save();
        }
        for (let index = 3; index < 7; index++) {
          products[index].category = categories[1];
          await products[index].save();
        }
        for (let index = 7; index < trials; index++) {
          products[index].category = categories[2];
          await products[index].save();
        }
        const category1Products = await Product.findCategoryProducts(
          categories[0]
        );
        const category2Products = await Product.findCategoryProducts(
          categories[1]
        );
        const category3Products = await Product.findCategoryProducts(
          categories[2]
        );

        category1Products.products.forEach((element) => {
          expect(element.category).toEqual(categories[0]);
        });
        category2Products.products.forEach((element) => {
          expect(element.category).toEqual(categories[1]);
        });
        category3Products.products.forEach((element) => {
          expect(element.category).toEqual(categories[2]);
        });
      });
    });
    describe("instance methods", () => {
      it(` isCreatedByAdminId returns true if the adminId created a product and false otherwise`, async () => {
        const trialAdminId = "ID2343949949994";
        for (let index = 0; index < products.length; index++) {
          expect(products[index].isCreatedByAdminId(admin.id)).toBeTruthy();
        }
        for (let index = 4; index < products.length; index++) {
          products[index].adminId = trialAdminId;
          await products[index].save();
        }
        for (let index = 4; index < products.length; index++) {
          expect(products[index].isCreatedByAdminId(trialAdminId)).toBeTruthy();
          expect(products[index].isCreatedByAdminId(admin.id)).toBeFalsy();
        }
      });
      it(` increaseQuantityBy increases a product quantity`, async () => {
        let initial, final, increment, testProduct;
        testProduct = products[0];
        initial = 50;
        increment = 89;
        final = initial + increment;
        testProduct.quantity = initial;
        await testProduct.save();
        await testProduct.increaseQuantityBy(increment);
        expect(testProduct.quantity).toEqual(final);
      });
      it(` reduceQuantityBy reduces a product quantity`, async () => {
        let initial, final, decrement, testProduct;
        testProduct = products[0];
        initial = 90;
        decrement = 45;
        final = initial - decrement;
        testProduct.quantity = initial;
        await testProduct.save();
        await testProduct.reduceQuantityBy(decrement);
        expect(testProduct.quantity).toEqual(final);
      });
      describe(` updateDetails updates product's details`, () => {
        it("when the product image is changed.", async () => {
          const testProductData = {
            title: ` test ${Math.floor(Math.random() * 100)}`.trim(),
            imageUrl: `to/${Math.floor(
              Math.random() * 100
            )}some/path.jpeg`.trim(),
            buyingPrice: Math.floor(Math.random() * 100) + 90.8,
            percentageProfit: Math.floor(Math.random() * 100),
            expirationPeriod: Math.floor(Math.random() * 100),
            description: `the first user test at  ${Math.floor(
              Math.random() * 100
            )} `.trim(),
            quantity: Math.floor(Math.random() * 100) + 34,
            adminId: admin._id,
            category: `category ${Math.floor(Math.random() * 100)}`.trim(),
            brand: `brand ${Math.floor(Math.random() * 100)}`.trim(),
          };
          let testProduct = products[0];
          let copyOfProductData = { ...testProductData };
          await testProduct.updateDetails(testProductData);

          for (const key in copyOfProductData) {
            if (copyOfProductData.hasOwnProperty(key))
              expect(copyOfProductData[key]).toEqual(testProductData[key]);
          }
          //ensure that the sellingPrice is also recalculated.
          let { buyingPrice, percentageProfit } = copyOfProductData;
          let expectedSellingPrice = (
            buyingPrice *
            (1 + percentageProfit / 100)
          ).toFixed(2);
          expect(expectedSellingPrice).toEqual(testProductData.sellingPrice);
        });
        it("when the product image is not changed.(image not provided).", async () => {
          const testProductData = {
            title: ` test ${Math.floor(Math.random() * 100)}`.trim(),
            buyingPrice: Math.floor(Math.random() * 100) + 90.8,
            percentageProfit: Math.floor(Math.random() * 100),
            expirationPeriod: Math.floor(Math.random() * 100),
            description: `the first user test at  ${Math.floor(
              Math.random() * 100
            )} `.trim(),
            quantity: Math.floor(Math.random() * 100) + 34,
            adminId: admin._id,
            category: `category ${Math.floor(Math.random() * 100)}`.trim(),
            brand: `brand ${Math.floor(Math.random() * 100)}`.trim(),
          };
          let testProduct = products[0];
          const previousImageUrl = testProduct.imageUrl;
          let copyOfProductData = { ...testProductData };
          await testProduct.updateDetails(testProductData);

          for (const key in copyOfProductData) {
            if (copyOfProductData.hasOwnProperty(key)) {
              if (key === "adminId") {
                expect(copyOfProductData[key].toString()).toEqual(
                  testProduct[key].toString()
                );
                continue;
              }

              expect(copyOfProductData[key]).toEqual(testProduct[key]);
            }
          }
          //ensure that the sellingPrice is also recalculated.
          let { buyingPrice, percentageProfit } = copyOfProductData;
          let expectedSellingPrice = (
            buyingPrice *
            (1 + percentageProfit / 100)
          ).toFixed(2);
          expect(
            Number(expectedSellingPrice) === testProduct.sellingPrice
          ).toBeTruthy();
          expect(previousImageUrl).toEqual(testProduct.imageUrl);
        });
      });
    });
  });
});
