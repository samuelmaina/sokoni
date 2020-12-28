const {AdminSales} = require("../../database/models");

const {includeSetUpAndTearDown} = require("./utils");
const {
  generateMongooseId,
  createTestProducts,
  clearTheDb,
} = require("../utils/generalUtils");

const {verifyEqual, verifyIDsAreEqual} = require("../utils/testsUtils");

const adminId = generateMongooseId();
let products = [];

describe.skip("AdminSales", () => {
  includeSetUpAndTearDown();
  beforeEach(async () => {
    products = await createTestProducts(adminId, 10);
  });
  afterEach(async () => {
    await clearTheDb();
  });
  it("createOne creates new adminSales", async () => {
    const adminSale = await AdminSales.createOne(adminId);
    verifyIDsAreEqual(adminSale.adminID, adminId);
  });
  describe("After Creation", () => {
    describe("Static", () => {
      it(`findOneForAdminId return sales for an admin with with each product 
          having title sellingPrice buyingPrice imageUrl populated`, async () => {
        const adminSales = await createNewAdminSales(adminId);
        await feedSomeProductsToAdminSales(adminSales);
        const populatedAdminSales = await AdminSales.findOneForAdminId(adminId);
        ensureProductsHaveAccurateProperties(populatedAdminSales.products, [
          "title",
          "sellingPrice",
          "buyingPrice",
          "imageUrl",
        ]);
      });
      it(`findSalesForAdminWithinAnInterval return the sale for period of time`, async () => {
        const adminSales = await createNewAdminSales(adminId);
        await feedSomeProductsToAdminSales(adminSales);
        const fromTime = Date.now() - 2000;
        const toTime = Date.now();
        const products = await AdminSales.findSalesForAdminIDWithinAnInterval(
          adminId,
          fromTime,
          toTime
        );
        verifyTHatProductsHaveProperties(products, [
          "title",
          "profit",
          "totalSales",
          "imageUrl",
        ]);
        //verify that the productSales  are within the range time.
      });
      it("findByAdminIdAndDelete deletes adminID sales", async () => {
        const adminSales = await createNewAdminSales(adminId);
        await feedSomeProductsToAdminSales(adminSales);

        let resultDoc = await AdminSales.findOne({adminID: adminId});
        expect(resultDoc).toHaveProperty("adminID");

        await AdminSales.findByAdminIdAndDelete(adminId);

        resultDoc = await AdminSales.findOne({adminID: adminId});
        expect(resultDoc).toBeNull();
      });
    });
    describe("Instance", () => {
      it("addOrderedProducts adds a product to  admin Sales", async () => {
        const adminSales = await createNewAdminSales(adminId);
        //used to store the random generated quantities for testing purposes.
        const quantities = [];
        for (let index = 0; index < products.length; index++) {
          const quantity = generateRandomIntegeUpto(100);
          quantities[index] = quantity;
          const product = products[index];
          const data = {
            productId: product.id,
            quantity,
          };
          await adminSales.addOrderedProducts(data);
        }
        const orderedProducts = adminSales.products;

        //ensure that the array contains something,else
        //the test will pass since the for loop won't have any loops.
        expect(orderedProducts.length).toBeGreaterThan(0);
        for (let index = 0; index < orderedProducts.length; index++) {
          const prod = orderedProducts[index];
          const sales = prod.sales;
          const expectedProducts = products[index];
          verifyIDsAreEqual(prod.productData, expectedProducts.id);
          //we have only sold once  so the first sale quantity should be equal to quantities[0]
          verifyEqual(quantities[index], sales[0].quantity);
          //verify that the sold Time is added;
          expect(sales[0]).toHaveProperty("soldAt");
        }
      });
      it("clearProducts clears products for adminID", async () => {
        const adminSales = await createNewAdminSales(adminId);
        await feedSomeProductsToAdminSales(adminSales);
        await adminSales.clearProducts();
        expect(adminSales.products.length).toEqual(0);
      });
    });
  });
});

const generateRandomIntegeUpto = upperLimit => {
  return Math.floor(Math.random() * upperLimit);
};
const verifyTHatProductsHaveProperties = (products = [], properties = []) => {
  products.forEach(product => {
    for (const prop of properties) {
      expect(product).toHaveProperty(prop);
    }
  });
};
const createNewAdminSales = async adminID => {
  let adminSales = new AdminSales({adminID});
  adminSales = await adminSales.save();
  return adminSales;
};
const ensureProductsHaveAccurateProperties = (
  receivedProducts = [],
  properties = []
) => {
  //ensure that the array contains something,else
  //the test will pass since the for loop won't any loops.
  expect(receivedProducts.length).toBeGreaterThan(0);
  for (let index = 0; index < receivedProducts.length; index++) {
    const product = receivedProducts[index].productData;
    const expectedProductData = products[index];
    for (let j = 0; j < properties.length; j++) {
      const property = properties[j];
      expect(product[property]).toEqual(expectedProductData[property]);
    }
  }
};
const feedSomeProductsToAdminSales = async adminSales => {
  for (let index = 0; index < products.length; index++) {
    const data = {
      productData: products[index].id,
      sales: [
        {
          quantity: 90,
          soldAt: Date.now(),
        },
      ],
    };
    adminSales.products.push(data);
    await adminSales.save();
  }
};
