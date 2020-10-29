const mongoose = require("mongoose");

const {connectToDb, closeConnectionToBd} = require("../config");

const {
  createTestProducts,
  createNewUser,
  clearTheDb,
} = require("../utils/generalUtils");
const {verifyIDsAreEqual, verifyEqual} = require("../utils/testsUtils");

const {Order} = require("../../database/models");

const TRIALS = 10;
const QUANTITY = 5;

const adminId = mongoose.Types.ObjectId();
const userId = mongoose.Types.ObjectId();
describe.skip("Order ", () => {
  beforeAll(async () => {
    await connectToDb();
  });
  afterAll(async () => {
    await closeConnectionToBd();
  });
  afterEach(async () => {
    await clearTheDb();
  });

  it("createOne creates a new Order", async () => {
    const products = await createTestProducts(adminId, 4);
    const orderData = createOrderData(products, userId);

    const expectedOrder = await new Order(orderData).save();
    const createdOrder = await Order.createOne(orderData);

    const orderedProducts = createdOrder.products;
    const expectedProducts = expectedOrder.products;

    orderedProducts.forEach((product, index) => {
      verifyEqual(product.productData, expectedProducts[index].productData);
    });

    verifyIDsAreEqual(createdOrder.userId, userId);
  });

  describe("After Creation", () => {
    let products = [];
    let orders;
    let ordersData;
    beforeEach(async () => {
      ordersData = await createSomeOrders(TRIALS, userId);
      orders = ordersData.orders;
      products = ordersData.products;
    });
    describe("Static Methods", () => {
      it("findAllforUserId  returns populated  orders sorted by ascending order time", async () => {
        const populatedOrders = await Order.findAllforUserId(userId);
        ensureOrdersAreInDescendingTime(populatedOrders);
      });
      it(`findByIdAndPopulateProductsDetails finds
          an order with the given id with title and selling price
          of ordered products populated`, async () => {
        for (let index = 0; index < orders.length; index++) {
          const order = orders[index];
          const orderId = order.id;
          const populatedOrder = await Order.findByIdAndPopulateProductsDetails(
            orderId
          );
          verifyIDsAreEqual(populatedOrder.userId, userId);
          const properties = ["title", "sellingPrice"];
          const orderedProducts = populatedOrder.products;
          //products is used to make sure that the orderedProduct's properties
          //have the right data since it was the array used to create the order.
          ensureProductsHaveProperties(orderedProducts, properties, products);
        }
      });
    });
    describe("Instance  Methods", () => {
      it(`populateDetails() populates title and sellingPrice of each ordered product.`, async () => {
        for (const order of orders) {
          const properties = ["title", "sellingPrice"];
          await order.populateDetails();
          ensureProductsHaveProperties(order.products, properties, products);
        }
      });
    });
  });
});

const ensureProductsHaveProperties = (
  products = [],
  properties,
  expectedProduct
) => {
  expect(products.length).toBeGreaterThan(0);

  //the values are entered in line, i.e products[0] is assigned to products[0]
  //in the order.we expect then to match.
  products.forEach((product, index) => {
    for (const prop of properties) {
      expect(product.productData).toHaveProperty(
        prop,
        expectedProduct[index][prop]
      );
    }
  });
};

const createSomeOrders = async (howMany, userId) => {
  const orders = [];
  const products = await createTestProducts(adminId, howMany);
  for (let index = 0; index < howMany; index++) {
    const orderData = createOrderData(products, userId);
    const order = await new Order(orderData).save();
    orders.push(order);
  }
  return {
    orders,
    products,
  };
};

const createOrderData = (products = [], userId) => {
  const orderedProducts = products.map(product => {
    const productData = product.id;
    //the caller expects the quantity to be in small letters.
    const quantity = QUANTITY;
    return {productData, quantity};
  });
  return {
    userId,
    products: orderedProducts,
  };
};

const ensureOrdersAreInDescendingTime = orders => {
  const ordersLength = orders.length;
  //if orders is an empty array, the forEach won't loop
  //and the  test will pass which will produce a  false positive.
  expect(ordersLength).toBeGreaterThan(0);
  orders.forEach((order, index) => {
    if (index < ordersLength - 1) {
      const nextOrder = orders[index + 1];
      expect(Date.parse(order.time)).toBeGreaterThanOrEqual(
        Date.parse(nextOrder.time)
      );
    }
  });
};
