const requires = require("../utils/requires");

const { Order } = requires.Models;
const {
  clearDb,
  createUserWithData,
  createTestProducts,
  ensureProductsHaveProperties,
} = require("../utils/generalUtils/database");
const {
  generateMongooseId,
  generateStringSizeN,
} = require("../utils/generalUtils/utils");
const {
  verifyEqual,
  verifyIDsAreEqual,
  verifyFalsy,
  verifyRejectsWithError,
} = require("../utils/testsUtils");
const { includeSetUpAndTearDown, ValidationError, ranges } = require("./utils");

const userCredentials = {
  name: "John Doe",
  email: "johndoe@gmail.com",
  password: "Password55?",
};

const { mongooseId, order } = ranges;
const { quantity, total } = order;

describe("Order", () => {
  let adminId, products, user;
  includeSetUpAndTearDown();
  beforeEach(async () => {
    adminId = generateMongooseId();
    products = await createTestProducts([adminId], 2);
    user = await createUserWithData(userCredentials);
  });
  afterEach(async () => {
    await clearDb();
  });
  describe("createOne", () => {
    const { exact } = mongooseId;
    const { min, max, error } = order.quantity;

    it("should create for correct Data", async () => {
      const sold = [
        {
          productData: products[0].id,
          quantity: min,
        },
        {
          productData: products[1].id,
          quantity: max,
        },
      ];
      const order = createOrderData(user.id, sold, min + max);
      const created = await Order.createOne(order);
      ensureOderHasTheRightData(created, order);
    });
    it("should refuse when user Id is not valid", async () => {
      const sold = [
        {
          productData: products[0].id,
          quantity: min,
        },
        {
          productData: products[1].id,
          quantity: max,
        },
      ];
      const userId = generateStringSizeN(exact);
      const order = createOrderData(userId, sold, min + max);

      verifyRejectsWithError(async () => {
        await Order.createOne(order);
      }, ValidationError);
    });
    it("should refuse when product id is incorrect", async () => {
      const sold = [
        {
          productData: generateStringSizeN(exact),
          quantity: min,
        },
        {
          productData: products[1].id,
          quantity: max,
        },
      ];
      const order = createOrderData(user.id, sold, min + max);

      verifyRejectsWithError(async () => {
        await Order.createOne(order);
      }, ValidationError);
    });
    describe("reject when quantity is out of bound", () => {
      it("less than the bound", async () => {
        const sold = [
          {
            productData: products[0].id,
            quantity: min - 1,
          },
          {
            productData: products[1].id,
            quantity: max,
          },
        ];
        const order = createOrderData(user.id, sold, min + max - 1);

        verifyRejectsWithError(async () => {
          await Order.createOne(order);
        }, error);
      });
      it("greater than the bound", async () => {
        const sold = [
          {
            productData: products[0].id,
            quantity: min,
          },
          {
            productData: products[1].id,
            quantity: max + 1,
          },
        ];
        const order = createOrderData(user.id, sold, min + max + 1);
        verifyRejectsWithError(async () => {
          await Order.createOne(order);
        }, error);
      });
    });

    describe("reject when total is out of bound", () => {
      let sold;
      beforeEach(() => {
        sold = [
          {
            productData: products[0].id,
            quantity: quantity.min,
          },
          {
            productData: products[1].id,
            quantity: quantity.max,
          },
        ];
      });
      const { min, max, error } = total;

      it("less than the bound", async () => {
        const order = createOrderData(user.id, sold, min - 1);
        verifyRejectsWithError(async () => {
          await Order.createOne(order);
        }, error);
      });
      it("greater than the bound", async () => {
        const order = createOrderData(user.id, sold, max + 1);
        verifyRejectsWithError(async () => {
          await Order.createOne(order);
        }, error);
      });
    });
  });
  describe("after creation", () => {
    describe("statics", () => {
      describe("findAllforUserId", () => {
        it("should return all order with the populated product data", async () => {
          let products;
          const adminId = generateMongooseId();
          const testUserId = generateMongooseId();
          products = await createTestProducts([adminId], 4);

          const sold = [
            {
              productData: products[0],
              quantity: quantity.min,
            },
            {
              productData: products[1],
              quantity: quantity.max,
            },
          ];

          const order1 = createOrderData(testUserId, sold, total.min);
          const order2 = createOrderData(testUserId, sold, total.max);
          const order3 = createOrderData(generateMongooseId(), sold, total.max);

          const orders = [order1, order2, order3];
          for (const data of orders) {
            await Order.createOne(data);
          }
          const retrieved = await Order.findAllforUserId(testUserId);
          verifyEqual(retrieved.length, 2);
          for (const order of retrieved) {
            verifyIDsAreEqual(order.userId, testUserId);
            const props = ["title", "adminId", "sellingPrice"];
            ensureProductsHaveProperties(order.products, props);
          }
        });
      });
      describe("findByIdAndPopulateProductsDetails", () => {
        it("should return order with the populated product data", async () => {
          let products;
          let created = [];
          const adminId = generateMongooseId();
          products = await createTestProducts([adminId], 4);

          const sold = [
            {
              productData: products[0],
              quantity: quantity.min,
            },
            {
              productData: products[1],
              quantity: quantity.max,
            },
          ];
          const order1 = createOrderData(generateMongooseId(), sold, total.min);
          const order2 = createOrderData(generateMongooseId(), sold, total.max);
          created.push(await Order.createOne(order1));
          created.push(await Order.createOne(order2));
          const firstOrder = created[0];
          const retrieved = await Order.findByIdAndPopulateProductsDetails(
            firstOrder.id
          );
          verifyIDsAreEqual(retrieved.userId, order1.userId);
          const props = ["title", "adminId", "sellingPrice"];
          ensureProductsHaveProperties(retrieved.products, props);
        });
      });
    });
    describe("methods", () => {
      let order;
      const { quantity } = ranges.order;
      const { min, max } = quantity;

      beforeEach(async () => {
        const sold = [
          {
            productData: products[0].id,
            quantity: min,
          },
          {
            productData: products[1].id,
            quantity: max,
          },
        ];
        const data = await createOrderData(
          generateMongooseId(),
          sold,
          total.min
        );
        order = await Order.createOne(data);
      });
      afterEach(async () => {
        await clearDb();
      });
      it("populateDetails", async () => {
        await order.populateDetails();
        const props = ["title", "sellingPrice", "adminId"];
        ensureProductsHaveProperties(order.products, props);
      });
    });
  });
});

function ensureOderHasTheRightData(created, dataUserForCreation) {
  verifyIDsAreEqual(created.userId, dataUserForCreation.userId);
  const createdProducts = created.products;
  const expectedProducts = dataUserForCreation.products;
  verifyEqual(createdProducts.length, expectedProducts.length);
  const findResults = [];
  for (const product of expectedProducts) {
    let found = false;
    for (const prod of createdProducts) {
      if (prod.productData._id.toString() === product.productData.toString()) {
        found = true;
        verifyEqual(prod.quantity, product.quantity);
      }
    }
    findResults.push(found);
  }
  let allNotFound = false;
  for (const findResult of findResults) {
    if (!findResult) allNotFound = true;
  }
  verifyFalsy(allNotFound);
}

function createOrderData(userId, products, total) {
  return {
    userId,
    products,
    total,
  };
}
