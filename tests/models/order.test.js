const { connectToDb, closeConnectionToBd } = require("../config");
const {
  createNewAdmin,
  deleteAdmin,
  deleteUser,
  createTestProducts,
  createNewUser,
  deleteAllProducts,
} = require("../utils");

const { Order, Admin, User } = require("../../database/models");
describe("Order ", () => {
  beforeAll(async () => {
    await connectToDb();
  });
  afterAll(async () => {
    await closeConnectionToBd();
  });
  it("createNew creates a new Order", async () => {
    const trials = 10;
    let admin = await createNewAdmin();
    let user = await createNewUser();
    let products = await createTestProducts(admin.id, trials);

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
    const orderData = {
      userId: user.id,
      orderedProducts: testOrderedProducts,
      total,
    };
    const order = await Order.createNew(orderData);

    //since order is created.We delete  all the data that was used to create the order.
    await Order.findByIdAndDelete(order.id);
    await deleteAdmin(admin.id);
    await deleteUser(user.id);
    await deleteAllProducts(products);
    expect(order.userId.toString()).toEqual(user.id.toString());
    for (const prop in orderData) {
      if (orderData.hasOwnProperty(prop)) {
        if (prop == "userId") {
          expect(orderData[prop].toString()).toEqual(order[prop].toString());
          continue;
        }
        if (prop == "orderedProducts") {
          const expectedOrderedProducts = order[prop];
          orderData[prop].forEach((element, index) => {
            expect(element.productData.toString()).toEqual(
              expectedOrderedProducts[index].productData.toString()
            );
          });
          continue;
        }
        expect(orderData[prop]).toEqual(order[prop]);
      }
    }
    expect(order.total).toEqual(total);
  });
  describe("After Creation", () => {
    let trials,
      total,
      admin,
      products = [],
      user,
      order,
      orders = [];
    beforeAll(async () => {
      trials = 10;
      total = 488995;
      admin = await createNewAdmin();
      user = await createNewUser();
      products = await createTestProducts(admin.id, trials);

      const orderedProducts = [
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

      for (let index = 0; index < 3; index++) {
        order = await new Order({
          userId: user.id,
          orderedProducts,
          total,
        });
        await order.save();
        orders[index] = order;
      }
    });
    afterAll(async () => {
      await deleteAdmin(admin.id);
      await deleteUser(user.id);
      await deleteAllProducts(products);
      for (let index = 0; index < orders.length; index++) {
        const id = orders[index].id;
        await Order.findByIdAndDelete(id);
      }
      orders = [];
    });
    describe("Static Methods", () => {
      it("findAllforUserId  returns populated  orders sorted by ascending order time", async () => {
        const populatedOrders = await Order.findAllforUserId(user.id);
        let orderedProducts;
        populatedOrders.forEach((order, index) => {
          //ensure that the order is created by userId
          expect(order.userId.toString()).toEqual(user.id.toString());

          //ensure that the orders are presented in ascending order.
          if (index < populatedOrders.length - 1) {
            expect(order.time >= populatedOrders[index + 1].time).toBeTruthy();
          }
          orderedProducts = order.orderedProducts;

          //ensure that the ordered products have both title and sellingPrice are populated
          let productData;
          orderedProducts.forEach((product, index) => {
            productData = product.productData;
            expect(productData.title).toEqual(products[index].title);
            expect(productData.sellingPrice).toEqual(
              products[index].sellingPrice
            );
          });
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

          //ensure that the ordered products have both title,sellingPrice and adminId populated
          let productData;
          populatedOrder.orderedProducts.forEach((product, index) => {
            productData = product.productData;
            expect(productData.title).toEqual(products[index].title);
            expect(productData.sellingPrice).toEqual(
              products[index].sellingPrice
            );
            expect(productData.adminId.toString()).toEqual(
              products[index].adminId.toString()
            );
          });
        }
      });
    });
  });
});
