const {includeSetUpAndTearDown} = require("./utils");

const {
  createTestProducts,
  clearTheDb,
  generateMongooseId,
} = require("../utils/generalUtils");
const {verifyIDsAreEqual, verifyEqual} = require("../utils/testsUtils");

const {Order} = require("../../database/models");

const TRIALS = 10;
const QUANTITY = 5;

const adminId = generateMongooseId();
const userId = generateMongooseId();
describe.skip("Order ", () => {
  includeSetUpAndTearDown();
  afterEach(async () => {
    await clearTheDb();
  });

  describe("Creation", () => {
    it("createOne creates a new Order", async () => {
      const arr = [adminId];
      const products = await createTestProducts(arr, TRIALS);
      const orderData = createOrderData(products, userId, 0);

      const expectedOrder = await new Order(orderData).save();
      const createdOrder = await Order.createOne(orderData);

      const orderedProducts = createdOrder.products;
      const expectedProducts = expectedOrder.products;

      orderedProducts.forEach((product, index) => {
        verifyEqual(product.productData, expectedProducts[index].productData);
      });

      verifyIDsAreEqual(createdOrder.userId, userId);
    });
  });

  describe("After Creation", () => {
    let products = [],
      orders = [],
      ordersData;
    beforeEach(async () => {
      ordersData = await createSomeOrders(TRIALS, userId);
      orders = ordersData.orders;
      products = ordersData.products;
    });
    describe("Static Methods", () => {
      it("findAllforUserId  returns populated  orders sorted by ascending order time", async () => {
        const populatedOrders = await Order.findAllforUserId(userId);
        ensureOrdersAreInDescendingTime(populatedOrders);
        const properties = ["title", "sellingPrice"];
        for (const order of populatedOrders) {
          verifyIDsAreEqual(order.userId, userId);
          ensureProductsHaveProperties(order.products, properties, products);
        }
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

          ensureProductsHaveProperties(orderedProducts, properties, products);
        }
      });
    });
    describe("Instance  Methods", () => {
      it(`populateDetails() populates title, sellingPrice and adminId of each ordered product.`, async () => {
        for (const order of orders) {
          const properties = ["title", "sellingPrice", "adminId"];
          await order.populateDetails();
          ensureProductsHaveProperties(order.products, properties, products);
        }
      });
    });
  });
});

/**
 *
 * @param {*} products test products
 * @param {*} properties expected properties
 * @param {*} expectedProducts products used to create the order.They are used to ensure that
 * the test products properties hold the right data.
 *
 */
const ensureProductsHaveProperties = (
  products = [],
  properties,
  expectedProducts
) => {
  expect(products.length).toBeGreaterThan(0);

  //the values are entered in line, i.e products[0] is assigned
  //to products[0] in the order.we expect then to match.
  products.forEach((product, index) => {
    for (const prop of properties) {
      expect(product.productData).toHaveProperty(
        prop,
        expectedProducts[index][prop]
      );
    }
  });
};

const createSomeOrders = async (howMany, userIds = []) => {
  const orders = [];
  const products = await createTestProducts([adminId], howMany);
  const noOfUserIds = userIds.length;
  for (let index = 0; index < howMany; index++) {
    const userId = index % noOfUserIds;
    const orderData = createOrderData(products, userIds[userId], index);
    const order = await new Order(orderData).save();
    orders.push(order);
  }
  return {
    orders,
    products,
  };
};

/**
 * @param {*} products array of products to  be ordered.
 * @param {*} multiple time in seconds from now.
 */
const createOrderData = (products = [], userId, multiple) => {
  const orderedProducts = products.map(product => {
    const productData = product.id;
    //the caller expects the quantity to be in small letters.
    const quantity = QUANTITY;
    return {productData, quantity};
  });
  return {
    userId,
    time: Date.now() + multiple * 1000,
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
      expect(parseDate(order.time)).toBeGreaterThan(parseDate(nextOrder.time));
    }
  });
};
const parseDate = date => {
  return Date.parse(date);
};
