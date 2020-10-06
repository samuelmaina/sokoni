const {connectToDb, closeConnectionToBd} = require("../config");
const {
  createNewAdmin,
  deleteAdminById,
  deleteUserById,
  createTestProducts,
  createNewUser,
  deleteAllProducts,
  clearDataFromAModel,
} = require("../utils/generalUtils");

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
    await clearDataFromAModel(Order);
    await closeConnectionToBd();
  });
  it("createNew creates a new Order", async () => {
    const {order} = await createOrderData();
    const expectedOrder = order;
    const createdOrder = await Order.createNew(expectedOrder);
    verifyUserIdCreatedOrder(createdOrder, expectedOrder.userId);
    for (const prop in expectedOrder) {
      if (expectedOrder.hasOwnProperty(prop)) {
        if (prop == "orderedProducts") {
          const expectedOrderedProducts = expectedOrder[prop];
          createdOrder[prop].forEach((element, index) => {
            expect(element.productData.toString()).toEqual(
              expectedOrderedProducts[index].productData.toString()
            );
          });
          continue;
        }
        expect(expectedOrder[prop]).toEqual(createdOrder[prop]);
      }
    }
    expect(createdOrder.total).toEqual(expectedOrder.total);

    //since order is created.We delete  all the data that was used to create the createdOrder.
    await Order.findByIdAndDelete(createdOrder.id);
    await deleteAdminById(admin.id);
    await deleteUserById(user.id);
    await deleteAllProducts(products);
  });

  // describe("After Creation", () => {
  //   let orders;
  //   let ordersData;
  //   beforeAll(async () => {
  //     admin = await createNewAdmin();
  //     user = await createNewUser();
  //     ordersData = await createSomeOrders(TRIALS);
  //   });
  //   beforeEach(() => {
  //     orders = ordersData.createdOrders;
  //     products = ordersData.products;
  //   });
  //   afterAll(async () => {
  //     await deleteAdminById(admin.id);
  //     await deleteUserById(user.id);
  //     await deleteAllProducts(products);
  //     await deleteAllOrders(orders);
  //   });
  //   describe("Static Methods", () => {
  //     it("findAllforUserId  returns populated  orders sorted by ascending order time", async () => {
  //       const populatedOrders = await Order.findAllforUserId(user.id);
  //       ensureOrdersInDescendingTime(populatedOrders);
  //       populatedOrders.forEach((order) => {
  //         verifyUserIdCreatedOrder(order, user.id);
  //       });
  //     });
  //     it(`findByIdAndPopulateProductsDetails finds
  //         an order with the given id with title and selling price
  //         of ordered products calculated`, async () => {
  //       for (let index = 0; index < orders.length; index++) {
  //         orderId = orders[index].id;
  //         const populatedOrder = await Order.findByIdAndPopulateProductsDetails(orderId);

  //         //ensure that the ordered products have both title,sellingPrice and adminId populated
  //         let productData;
  //         //
  //       }
  //     });
  //   });
  // });
});

const deleteAllOrders = async (orders = []) => {
  for (let index = 0; index < orders.length; index++) {
    const id = orders[index].id;
    await Order.findByIdAndDelete(id);
  }
  orders = [];
};

const createOrderData = async () => {
  const products = await createTestProducts(admin.id, 4);
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
  return {
    order,
    products,
  };
};

const createSomeOrders = async (TRIALS) => {
  const createdOrders = [];
  let order;
  let products;
  for (let index = 0; index < TRIALS; index++) {
    const orderData = await createOrderData();
    order = orderData.order;
    products = orderData.products;
    createdOrders[index] = await new Order(order).save();
  }
  return {createdOrders, products};
};

const verifyUserIdCreatedOrder = (order, userId) => {
  expect(order.userId.toString()).toEqual(user.id.toString());
};
const ensureOrdersInDescendingTime = (orders) => {
  orders.forEach((orders, index) => {
    if (index < populatedOrders.length - 1) {
      expect(order.time >= orders[index + 1].time).toBeTruthy();
    }
  });
};

const verifyOrderedProductsHasProperties = (orderedProducts, properties = []) => {
  orderedProducts.forEach((product, index) => {
    productData = product.productData;
    for (const element of properties) {
      expect(productData[element]).toEqual(products[index][element]);
    }
  });
};
