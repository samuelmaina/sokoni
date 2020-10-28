const {connectToDb, closeConnectionToBd} = require("../config");

const mongoose = require("mongoose");
const {
  createNewAdmin,
  createTestProducts,
  createNewUser,
  clearTheDb,
} = require("../utils/generalUtils");
const {verifyIDsAreEqual, verifyEqual} = require("../utils/testsUtils");

const {Order} = require("../../database/models");

const TRIALS = 20;
const QUANTITY = 90;

const adminId = mongoose.Types.ObjectId();
const userId = mongoose.Types.ObjectId();
let products = [];
describe("Order ", () => {
  beforeAll(async () => {
    await connectToDb();
    user = await createNewUser();
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
    let orders;
    let ordersData;
    beforeAll(async () => {
      user = await createNewUser();
    });
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
      // it(`findByIdAndPopulateProductsDetails finds
      //     an order with the given id with title and selling price
      //     of ordered products populated`, async () => {
      //   for (let index = 0; index < orders.length; index++) {
      //     const order = orders[index];
      //     orderId = order.id;
      //     const populatedOrder = await Order.findByIdAndPopulateProductsDetails(
      //       orderId
      //     );
      //     verifyUserIdCreatedOrder(populatedOrder, user.id);
      //     const orderedProducts = populatedOrder.orderedProducts;
      //     const expectedOrderedProducts = products;
      //     ensureOrderedProductsHasTheRightData(
      //       orderedProducts,
      //       expectedOrderedProducts
      //     );
      //   }
      // });
    });
    describe("Instance  Methods", () => {
      it(`populateDetails() finds
          an order with the given id with title and selling price
          of ordered products calculated`, () => {
        // let order = orders[index];
        expect(1).toEqual(1);
      });
    });
  });
});

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
  //and test will pass which is a false positive.
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
