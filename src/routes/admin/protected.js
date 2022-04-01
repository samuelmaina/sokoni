const express = require("express");

const fileUploader = require("../../middlewares/app/fileUploader");

const { admin } = require("../../controllers");

const { product, productQuery } = require("../../validators");
const productValidtor = product.productValidator;
const productQueryValidator = productQuery.productQueryValidator;

const controller = admin;

const router = express.Router();

router
  .route("/add-product")
  .get(controller.getAddProduct)
  .post(fileUploader, productValidtor, controller.postAddProduct);

router.get(
  "/edit-product/:id",
  productQueryValidator,
  controller.getEditProduct
);
router.post(
  "/edit-product",
  fileUploader,
  productValidtor,
  productQueryValidator,
  controller.postEditProduct
);

router.get("/products", productQueryValidator, controller.getProducts);
router.get(
  "/category/:category",
  productQueryValidator,
  controller.getCategoryProducts
);
router.delete("/product/:id", controller.deleteProduct);
router.get("/get-admin-sales", controller.getAdminSales);

module.exports = router;
