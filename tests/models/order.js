const {connectToDb, closeConnectionToBd} = require("../config");
const {
  createNewAdmin,
  createTestProducts,
  createNewUser,
  clearTheDb,
} = require("../utils/generalUtils");
const {verifyIDsAreEqual, verifyEqual} = require("../utils/testsUtils");

const {Order} = require("../../database/models");

const TRIALS = 10;

let admin;
let user;
let products = [];
describe("Order ", () => {
  beforeAll(async () => {
    await connectToDb();
    admin = await createNewAdmin();
    user = await createNewUser();
  });
  afterAll(async () => {
    await closeConnectionToBd();
  });
  afterEach(async () => {
    await clearTheDb();
  });
  it("createNew creates a new Order", async () => {
    const products = await createTestProducts(admin.id, 4);
    const expectedOrder = await createOrderData(products);
    const createdOrder = await Order.createNew(expectedOrder);
    ensureOrderedProductsHasTheRightData(
      createdOrder.orderedProducts,
      expectedOrder.orderedProducts
    );
    verifyUserIdCreatedOrder(createdOrder, expectedOrder.userId);
    verifyEqual(createdOrder.total, expectedOrder.total);
  });

  describe("After Creation", () => {
    let orders;
    let ordersData;
    beforeAll(async () => {
      admin = await createNewAdmin();
      user = await createNewUser();
    });
    beforeEach(async () => {
      ordersData = await createSomeOrders(TRIALS);
      orders = ordersData.createdOrders;
      products = ordersData.products;
    });
    afterEach(async () => {
      await clearTheDb();
    });
    describe("Static Methods", () => {
      it("findAllforUserId  returns populated  orders sorted by ascending order time", async () => {
        const populatedOrders = await Order.findAllforUserId(user.id);
        ensureOrdersAreInDescendingTime(populatedOrders);
        populatedOrders.forEach(order => {
          verifyUserIdCreatedOrder(order, user.id);
          verifyOrderedProductsHaveProperties(order.orderedProducts, [
            "title",
            "sellingPrice",
          ]);
        });
      });
      it(`findByIdAndPopulateProductsDetails finds
          an order with the given id with title and selling price
          of ordered products calculated`, async () => {
        for (let index = 0; index < orders.length; index++) {
          orderId = orders[index].id;
          const populatedOrder = await Order.findByIdAndPopulateProductsDetails(
            orderId
          );
          verifyUserIdCreatedOrder(populatedOrder, user.id);
          verifyOrderedProductsHaveProperties(populatedOrder.orderedProducts, [
            "title",
            "sellingPrice",
            "adminId",
          ]);
        }
      });
    });
  });
});

const ensureOrderedProductsHasTheRightData = (
  orderedProducts,
  expectedOrderedProducts
) => {
  orderedProducts.forEach((product, index) => {
    const expectedProduct = expectedOrderedProducts[index];
    verifyIDsAreEqual(product.productData, expectedProduct.productData);
    verifyEqual(product.quantity, expectedProduct.quantity);
  });
};

const createOrderData = async (products = []) => {
  const testOrderedProducts = [
    {
      productData: products[0].id,
      quantity: 90,
    },
    {
      productData: products[1].id,
      quantity: 45,
    },

    {
      productData: products[2].id,
      quantity: 23,
    },
    {
      productData: products[3].id,
      quantity: 100,
    },
  ];

  let total = 0.0;
  testOrderedProducts.forEach((element, index) => {
    total += element.quantity * products[index].sellingPrice;
  });
  total = Number(total.toFixed(2));
  const order = {
    userId: user.id,
    orderedProducts: testOrderedProducts,
    total,
  };
  return order;
};

const createSomeOrders = async TRIALS => {
  const createdOrders = [];
  let order;
  const products = await createTestProducts(admin.id, 4);

  order = await createOrderData(products);

  order = await new Order(order).save();
  createdOrders.push(order);
  return {createdOrders, products};
};

const verifyUserIdCreatedOrder = (order, userId) => {
  verifyIDsAreEqual(order.userId, userId);
};
const ensureOrdersAreInDescendingTime = orders => {
  orders.forEach((order, index) => {
    if (index < orders.length - 1) {
      expect(order.time >= orders[index + 1].time).toBeTruthy();
    }
  });
};

const verifyOrderedProductsHaveProperties = (
  orderedProducts,
  properties = []
) => {
  orderedProducts.forEach((product, index) => {
    const productData = product.productData;
    for (const element of properties) {
      if (element === "adminId") {
        verifyIDsAreEqual(productData[element], products[index][element]);
        continue;
      }
      verifyEqual(products[index][element], productData[element]);
    }
  });
};
