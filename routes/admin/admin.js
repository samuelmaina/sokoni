const express = require("express");

const {admin} = require("../../controllers");

const {product} = require("../../validators");
const {
  titleValidator,
  buyingPriceValidator,
  percentageProfitValidator,
  expirationPeriodValidator,
  quantityValidator,
  descriptionValidator,
  brandValidator,
  categoryValidator,
} = product;
const productValidators = [
  titleValidator,
  buyingPriceValidator,
  percentageProfitValidator,
  expirationPeriodValidator,
  quantityValidator,
  descriptionValidator,
  brandValidator,
  categoryValidator,
];

const controller = admin;

const router = express.Router();

router
  .route("/add-product")
  .get(controller.getAddProduct)
  .post(productValidators, controller.postAddProduct);

router.get("/edit-product/:id", controller.getEditProduct);
router.post("/edit-product", productValidators, controller.postEditProduct);

router.get("/products", controller.getProducts);
router.delete("/product/:id", controller.deleteProduct);
router.get("/get-admin-sales", controller.getAdminSales);

module.exports = router;
