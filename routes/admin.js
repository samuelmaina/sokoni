const express = require("express");
const validators = require("../util/validators/product");

const IsAuth = require("../authmiddleware/adminRoutesProtect");

const adminController = require("../controllers/admin");

const router = express.Router();

router.get("/add-product", IsAuth, adminController.getAddProduct);
router.post(
  "/add-product",
  IsAuth,
  validators.productInfoValidation,
  adminController.postAddProduct
);

router.get("/edit-product/:productId", IsAuth, adminController.getEditProduct);
router.post(
  "/edit-product",
  IsAuth,
  validators.productInfoValidation,
  adminController.postEditProduct
);

router.get("/products", IsAuth, adminController.getProducts);
router.post("/delete-product", IsAuth, adminController.postDeleteProduct);
router.get('/get-admin-sales',IsAuth,adminController.getAdminSales);

module.exports = router;
