const express = require("express");
const validators = require("../util/validators/product");

const ensureAdminAuthenticated = require("../authmiddleware/adminRoutesProtect");

const adminController = require("../controllers/admin");

const router = express.Router();

router.get("/add-product", ensureAdminAuthenticated, adminController.getAddProduct);
router.post(
  "/add-product",
  ensureAdminAuthenticated,
  validators.productInfoValidation,
  adminController.postAddProduct
);

router.get("/edit-product/:productId", ensureAdminAuthenticated, adminController.getEditProduct);
router.post(
  "/edit-product",
  ensureAdminAuthenticated,
  validators.productInfoValidation,
  adminController.postEditProduct
);

router.get("/products", ensureAdminAuthenticated, adminController.getProducts);
router.post("/delete-product", ensureAdminAuthenticated, adminController.postDeleteProduct);
router.get('/get-admin-sales',ensureAdminAuthenticated,adminController.getAdminSales);

module.exports = router;
