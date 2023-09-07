const requires = require("../utils/requires");

const { AdminSales } = requires.Models;

const {
  verifyEqual,

  verifyIDsAreEqual,
  ensureCloselyEqual,
  verifyTruthy,
  ensureValueGreateThan,
} = require("../utils/testsUtils");

const {
  includeSetUpAndTearDown,
  ensureObjectsHaveSameFields,
} = require("./utils");
const {
  clearDb,
  createTestProducts,
  createAdminSalesTestDataForAdminId,
  ensureProductsHaveProperties,
} = require("../utils/generalUtils/database");
const { generateMongooseId } = require("../utils/generalUtils/utils");

describe("Admin Sales", () => {
  includeSetUpAndTearDown();
  afterEach(async () => {
    await clearDb();
  });

  it("createOne", async () => {
    const adminId = generateMongooseId();
    const adminSales = await AdminSales.createOne(adminId);
    verifyIDsAreEqual(adminId, adminSales.adminId);
  });
  describe("After Creation", () => {
    describe("statics", () => {
      it("findOneByAdminId should return sales using adminId", async () => {
        const adminId1 = generateMongooseId();
        const adminId2 = generateMongooseId();
        await AdminSales.createOne(adminId1);
        await AdminSales.createOne(adminId2);
        const retrieved = await AdminSales.findOneByAdminId(adminId2);
        verifyIDsAreEqual(retrieved.adminId, adminId2);
      });

      describe("addSalesToAdmins", () => {
        const adminId = generateMongooseId();
        let products;
        beforeEach(async () => {
          products = await createTestProducts([adminId], 2);
        });
        it("should create one when an admin does not exist", async () => {
          const adminId = generateMongooseId();
          const products = await createTestProducts([adminId], 2);
          const orderedProducts = [
            { productData: products[0], quantity: 2 },
            { productData: products[1], quantity: 2 },
          ];
          await AdminSales.addSalesToAdmins(orderedProducts);
          const noOfDocs = await AdminSales.find().countDocuments();
          verifyEqual(noOfDocs, 1);
        });
        it("should add to adminSales if the admin exists", async () => {
          await AdminSales.createOne(adminId);
          const orderedProducts = [
            { productData: products[0], quantity: 2 },
            { productData: products[1], quantity: 2 },
          ];
          await AdminSales.addSalesToAdmins(orderedProducts);
          //ensure does not add another doc
          const retrieved = await AdminSales.find();
          verifyEqual(retrieved.length, 1);
          //ensure that the sales data is added.
          const soldProducts = retrieved[0].products;
          verifyEqual(soldProducts.length, 2);
          verifyEqual(soldProducts[0].sales.length, 1);
        });
      });
      it("findOneForAdminIdAndPopulateProductsData", async () => {
        const adminId = generateMongooseId();
        const numberOfProds = 10;

        const created = await createTestProducts([adminId], numberOfProds);
        await createAdminSalesTestDataForAdminId(adminId, created);

        const sales = await AdminSales.findOneForAdminIdAndPopulateProductsData(
          adminId
        );
        const props = [
          "title",
          "sellingPrice",
          "buyingPrice",
          "sales",
          "imageUrl",
        ];
        ensureProductsHaveProperties(sales, props);
        sales.forEach((product, index) => {
          const { total, productData, profit, sales } = product;
          verifyEqual(
            total,
            Number((100 * productData.sellingPrice).toFixed(2))
          );
          ensureCloselyEqual(
            profit,
            Number((total - productData.buyingPrice * 100).toFixed(2))
          );

          //ensure that arranged according to their profits in descending order.
          if (hasNextElement()) {
            verifyTruthy(product.profit <= sales[index + 1].profit);
          }
          function hasNextElement() {
            return index < sales.size - 1;
          }
        });
      });
    });
    describe("methods", () => {
      let adminSales;
      let adminId;
      beforeEach(async () => {
        adminId = generateMongooseId();
        adminSales = await AdminSales.createOne(adminId);
      });
      it("addSales ", async () => {
        const sale = {
          productId: generateMongooseId(),
          quantity: 5,
        };
        await adminSales.addSale(sale);
        verifyIDsAreEqual(adminSales.adminId, adminId);
        const first = adminSales.products[0];
        verifyIDsAreEqual(first.productData, sale.productId);
        verifyEqual(first.sales[0].quantity, sale.quantity);
      });
    });
  });
});
