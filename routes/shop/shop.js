const {ensureUserIsAuth} = require("../../authmiddleware");

const express = require("express");

const {shop} = require("../../controllers");

const router = express.Router();

router.get("/", shop.getIndex);

router.get("/products", shop.getProducts);

router.get("/product/:productId", shop.getProduct);
router.get("/category/:category", shop.getProductPerCategory);
router.post("/add-to-cart", ensureUserIsAuth, shop.getAddToCart);
router
  .route("/cart")
  .get(ensureUserIsAuth, shop.getCart)
  .post(ensureUserIsAuth, shop.postToCart);

router.post("/cart-delete-item", ensureUserIsAuth, shop.postCartDeleteProduct);

router.get("/orders", ensureUserIsAuth, shop.getOrders);

router.post("/create-order", ensureUserIsAuth, shop.createOrder);

router.get("/orders/:orderId", ensureUserIsAuth, shop.createInvoicePdf);

module.exports = router;
