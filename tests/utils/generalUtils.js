const {User, Admin, Product} = require("../../database/models");

exports.clearDataFromAModel = async (Model) => {
  const documents = await Model.find();
  documents.forEach(async (element) => {
    await Model.findByIdAndDelete(element.id);
  });
};

exports.createNewAdmin = async () => {
  let admin = new Admin({
    name: "Samuel Maina",
    email: "samuelmayna@gmail.com",
    password: "Smainachez88(??",
  });
  admin = await admin.save();
  return admin;
};
exports.deleteAdminById = (adminId) => {
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

exports.deleteUserById = (userId) => {
  return User.findByIdAndDelete(userId);
};

exports.createTestProducts = async (adminId, numberOfProducts) => {
  let product,
    products = [],
    trials = numberOfProducts;
  for (let index = 0; index < trials; index++) {
    product = new Product(this.getRandomProductData(adminId));
    product.sellingPrice = (
      (1 + product.percentageProfit / 100) *
      product.buyingPrice
    ).toFixed(2);
    await product.save();
    products[index] = product;
  }
  return products;
};

exports.deleteAllProducts = async (products) => {
  for (let index = 0; index < products.length; index++) {
    await Product.findByIdAndDelete(products[index].id);
  }
  products = [];
};

exports.getRandomProductData = (adminId) => {
  return {
    title: ` test ${Math.floor(Math.random() * 100)}`.trim(),
    imageUrl: `to/some/image${Math.floor(Math.random() * 100)}`,
    buyingPrice: Math.floor(Math.random() * 100) + 2,
    percentageProfit: Math.floor(Math.random() * 100) + 2,
    expirationPeriod: Math.floor(Math.random() * 100) + 2,
    description: `the first user test at  ${Math.floor(Math.random() * 100)} `.trim(),
    quantity: Math.ceil(Math.random() * 100) + 2,
    adminId,
    category: `category ${Math.floor(Math.random() * 100)}`.trim(),
    brand: `brand ${Math.floor(Math.random() * 100)}`.trim(),
  };
};
