const ensureUserAuthenticated = require("../../authmiddleware/userRoutesProtect");

const express = require("express");

const shopController = require("../../controllers/shop");

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/product/:productId", shopController.getProduct);
router.get("/category/:category", shopController.getProductPerCategory);
router.post(
  "/add-to-cart",
  ensureUserAuthenticated,
  shopController.getAddToCart
);
router
  .route("/cart")
  .get(ensureUserAuthenticated, shopController.getCart)
  .post(ensureUserAuthenticated, shopController.postToCart);

router.post(
  "/cart-delete-item",
  ensureUserAuthenticated,
  shopController.postCartDeleteProduct
);

router.get("/orders", ensureUserAuthenticated, shopController.getOrders);

router.post(
  "/create-order",
  ensureUserAuthenticated,
  shopController.createOrder
);

router.get(
  "/orders/:orderId",
  ensureUserAuthenticated,
  shopController.createInvoicePdf
);

// router.get('/checkout', shopController.getCheckout);

module.exports = router;
