const express = require("express");

const {admin} = require("../../controllers");

let {validators} = require("../../utils");
const {product} = validators;
validators = product;
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
