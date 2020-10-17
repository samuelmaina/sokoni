const {Admin, Product, AdminSales} = require("../../database/models");

const assert = require("assert");

const {connectToDb, closeConnectionToBd} = require("../config");
const {
  createNewAdmin,
  createTestProducts,
  clearTheDb,
} = require("../utils/generalUtils");

const {verifyEqual, verifyIDsAreEqual} = require("../utils/testsUtils");

let admin;
let products = [];

describe("AdminSales", () => {
  beforeAll(async () => {
    await connectToDb();
  });
  afterAll(async () => {
    await closeConnectionToBd();
  });

  beforeEach(async () => {
    admin = await createNewAdmin();
    products = await createTestProducts(admin.id, 10);
  });
  afterEach(async () => {
    await clearTheDb();
  });
  it("createNew creates new adminSales", async () => {
    const adminSale = await AdminSales.createNew(admin.id);
    verifyIDsAreEqual(adminSale.adminId, admin.id);
  });
  it(`findOneForAdminId return sales for an admin with with each product
  having title sellingPrice buyingPrice imageUrl populated`, async () => {
    const adminSales = await createNewAdminSales(admin.id);
    await feedSomeProductsToAdminSales(adminSales);
    const populatedAdminSales = await AdminSales.findOneForAdminId(admin.id);
    ensureProductsHaveAccurateProperties(populatedAdminSales.products, [
      "title",
      "sellingPrice",
      "buyingPrice",
      "imageUrl",
    ]);
  });
  it(`getSalesForAdminIdWithinAnInterval return the sale for period of time`, async () => {
    const adminSales = await createNewAdminSales(admin.id);
    await feedSomeProductsToAdminSales(adminSales);
    const fromTime = Date.now() - 20;
    const toTime = Date.now();

    const sales = getSalesForAdminIdWithinAnInterval(
      admin.id,
      fromTime,
      toTime
    );
    verifyIDsAreEqual(s);
  });
  it("addOrderedProduct adds a product to  admin Sales", async () => {
    const adminSales = await createNewAdminSales(admin.id);
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
      await adminSales.addOrderedProduct(data);
    }
    const orderedProducts = adminSales.products;

    //ensure that the array contains something,else
    //the test will pass since the for loop won't any loops.
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
});
const createNewAdminSales = async adminId => {
  let adminSales = new AdminSales({adminId});
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
          quantity: generateRandomIntegeUpto(100),
          soldAt: Date.now(),
        },
      ],
    };
    adminSales.products.push(data);
    await adminSales.save();
  }
};

const generateRandomIntegeUpto = N => {
  return Math.ceil(Math.random() * N);
};
