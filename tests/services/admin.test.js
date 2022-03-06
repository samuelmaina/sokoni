
const requires= require('../utils/requires');

const { generateMongooseId } = require("../utils/generalUtils/utils");

const MAX_TESTING_TIME = 20000;

const { adminServices } = requires.services;
const {
  verifyEqual,
  verifyTruthy,
  verifyFalsy,
} = require("../utils/testsUtils");
const { clearModelsInProductTests } = require("../e2e/utils/generalUtils");
const {
  createTestFile,
  findExistingProducts,
  isFileExisting,
} = require("./utils");
const { checkIfExist } = require("../../utils/imageCloudStorage");
const { createTestProducts } = require("../utils/generalUtils/database");

const session = { admin: { _id: generateMongooseId() } };

describe.skip("admin services", () => {
  const { includeSetUpAndTearDown } = require("../models/utils");
  includeSetUpAndTearDown();
  describe("Adding Product", () => {
    afterEach(clearModelsInProductTests);
    it(
      "should add a product  if all the relevant data is there",
      async () => {
        const valid = {
          title: "test 1",
          buyingPrice: 200.34,
          percentageProfit: 20,
          quantity: 200,
          brand: "The good Brand",
          category: "clothing",
          description: "The product was very good I  loved it.",
        };
        const path = await createTestFile();

        const req = {
          body: valid,
          session,
          file: { path },
        };

        const result = await adminServices.addProduct(req);
        const prods = await findExistingProducts();
        verifyEqual(prods.length, 1);
        verifyEqual(result.info, "Product added successfully.");
        verifyFalsy(isFileExisting(path));
        verifyTruthy(await checkIfExist(prods[0].public_id));
      },
      MAX_TESTING_TIME
    );
  });

  describe("Editing ", () => {
    let created;
    beforeEach(async () => {
      created = (await createTestProducts([session.admin._id], 1))[0];
    });
    afterEach(clearModelsInProductTests);
    it(
      "should not be able to access a product if it does not exist.",
      async () => {
        const req = {
          params: {
            id: generateMongooseId(),
          },
          session,
        };
        const result = await adminServices.getEditPage(req);
        verifyEqual(
          result.error.message,
          "Product not there or you are not authorised to modify it"
        );
      },
      MAX_TESTING_TIME
    );
    it(
      "should not be able to view a product if they did not crated it.",
      async () => {
        const req = {
          params: {
            id: created._id,
          },
          session: {
            admin: {
              id: generateMongooseId(),
            },
          },
        };
        const result = await adminServices.getEditPage(req);
        verifyEqual(
          result.error.message,
          "Product not there or you are not authorised to modify it"
        );
        verifyEqual(result.error.redirect, "/admin/products");
      },
      MAX_TESTING_TIME
    );

    it(
      "should add a product all the relevant data is there",
      async () => {
        const valid = {
          title: "test 1",
          buyingPrice: 200.34,
          percentageProfit: 20,
          quantity: 200,
          brand: "The good Brand",
          category: "clothing",
          description: "The product was very good I  loved it.",
        };
        const path = await createTestFile();

        const req = {
          body: valid,
          session,
          file: { path },
        };

        const result = await adminServices.addProduct(req);
        const prods = await findExistingProducts();
        verifyEqual(prods.length, 1);
        verifyEqual(result.info, "Product added successfully.");
        verifyFalsy(isFileExisting(path));
        verifyTruthy(await checkIfExist(prods[0].public_id));
      },
      MAX_TESTING_TIME
    );
  });
});
