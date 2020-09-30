const express = require("express");

const validators = require("../../util/validators/product");
const controller = require("../../controllers/admin");

const router = express.Router();

router
  .route("/add-product")
  .get(controller.getAddProduct)
  .post(validators.productInfoValidation, controller.postAddProduct);

router.get("/edit-product/:productId", controller.getEditProduct);
router.post(
  "/edit-product",
  validators.productInfoValidation,
  controller.postEditProduct
);

router.get("/products", controller.getProducts);
router.delete("/product/:productId", controller.deleteProduct);
router.get("/get-admin-sales", controller.getAdminSales);

module.exports = router;
