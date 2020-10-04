const { User, Admin, Product } = require("../database/models");

const assert = require("assert");

const PRODUCTS_PER_PAGE = parseInt(process.env.PRODUCTS_PER_PAGE);

exports.createNewAdmin = async () => {
  let admin = new Admin({
    name: "Samuel Maina",
    email: "samuelmayna@gmail.com",
    password: "Smainachez88(??",
  });
  admin = await admin.save();
  return admin;
};
exports.deleteAdmin = (adminId) => {
  return Admin.findByIdAndDelete(adminId);
};

exports.createNewUser = async () => {
  let user = new User({
    name: "Samuel Maina",
    email: "samuelmayna@gmail.com",
    password: "Smainachez88(??",
  });
  user = await user.save();
  return user;
};

exports.deleteUser = (userId) => {
  return User.findByIdAndDelete(userId);
};

exports.deleteAllProducts = async (products) => {
  for (let index = 0; index < products.length; index++) {
    await Product.findByIdAndDelete(products[index].id);
  }
  products = [];
  assert.equal(await Product.find().countDocuments(), 0);
};
exports.createTestProducts = async (adminId, numberOfProducts) => {
  let product,
    products = [],
    trials = numberOfProducts;
  for (let index = 0; index < trials; index++) {
    product = await new Product({
      title: ` test ${Math.floor(Math.random() * 100)}`.trim(),
      imageUrl: `to/some/image${Math.floor(Math.random() * 100)}`,
      buyingPrice: Math.floor(Math.random() * 100) + 90.8,
      percentageProfit: Math.floor(Math.random() * 100),
      expirationPeriod: Math.floor(Math.random() * 100),
      description: `the first user test at  ${Math.floor(
        Math.random() * 100
      )} `.trim(),
      quantity: Math.floor(Math.random() * 100) + 34,
      adminId,
      category: `category ${Math.floor(Math.random() * 100)}`.trim(),
      brand: `brand ${Math.floor(Math.random() * 100)}`.trim(),
    });
    let sellingPrice =
      (1 + product.percentageProfit / 100) * product.buyingPrice;
    sellingPrice = sellingPrice.toFixed(2);
    product.sellingPrice = sellingPrice;
    await product.save();
    products[index] = product;
  }
  return products;
};
exports.calculatePaginationData = (page, total) => {
  return {
    hasNextPage: page * PRODUCTS_PER_PAGE < total,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(total / PRODUCTS_PER_PAGE),
    currentPage: page,
  };
};
