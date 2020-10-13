const express = require("express");

const fileUploader = require("../../appMiddlewares/fileUploader");

let utils = require("../../util");
const {product} = utils.validators;
const validators = product;
const {admin} = require("../../controllers");
const controller = admin;

const router = express.Router();

router
  .route("/add-product")
  .get(controller.getAddProduct)
  .post(validators.productInfoValidation, controller.postAddProduct);

router.get("/edit-product/:id", controller.getEditProduct);
router.post(
  "/edit-product",
  validators.productInfoValidation,
  controller.postEditProduct
);

router.get("/products", controller.getProducts);
router.delete("/product/:id", controller.deleteProduct);
router.get("/get-admin-sales", controller.getAdminSales);

module.exports = router;
