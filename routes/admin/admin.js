const express = require("express");

const {admin} = require("../../controllers");

const {product} = require("../../validators");


const controller = admin;

const router = express.Router();

router
  .route("/add-product")
  .get(controller.getAddProduct)
  .post(product, controller.postAddProduct);

router.get("/edit-product/:id", controller.getEditProduct);
router.post("/edit-product", product, controller.postEditProduct);

router.get("/products", controller.getProducts);
router.delete("/product/:id", controller.deleteProduct);
router.get("/get-admin-sales", controller.getAdminSales);

module.exports = router;
