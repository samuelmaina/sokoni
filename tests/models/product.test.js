const { Admin, Product } = require("../../database/models/index");

const { connectToDb, closeConnectionToBd } = require("../config");

describe("--Product ", () => {
  beforeEach(async () => {
    await connectToDb();
  });
  afterEach(async () => {
    await closeConnectionToBd();
  });
  it("it creates a products", async () => {
    const admin = await Admin.createNew({
      name: "Samuel Maina",
      email: "samuelmayna@gmail.com",
      password: "Smainachez88(??",
    });

    const productData = {
      title: ` test ${Math.floor(Math.random() * 100)}`.trim(),
      imageUrl: `to/${Math.floor(Math.random() * 100)}some/path.jpeg`.trim(),
      buyingPrice: Math.floor(Math.random() * 100),
      percentageProfit: Math.floor(Math.random() * 100),
      expirationPeriod: Math.floor(Math.random() * 100),
      description: `the first user test at  ${Math.floor(
        Math.random() * 100
      )} `.trim(),
      quantity: Math.floor(Math.random() * 100),
      adminId: admin._id,
      category: `category ${Math.floor(Math.random() * 100)}`.trim(),
      brand: `brand ${Math.floor(Math.random() * 100)}`.trim(),
    };

    //need to make a copy because the productData object has some property added
    //to it by createNew methods.The property are added using different rules.
    const productCopy = { ...productData };
    const product = await Product.createNew(productData);
    for (const key in productCopy) {
      //for mongoose Ids we need to convert them into strings for
      //proper comparison.
      if (key == "adminId") {
        expect(productData[key].toString()).toEqual(product[key].toString());
        continue;
      }
      expect(productData[key]).toEqual(product[key]);
    }

    await Admin.findByIdAndDelete(admin.id);
    await Product.findByIdAndDelete(product.id);
  });
});
