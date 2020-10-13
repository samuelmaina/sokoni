const {userRoutesProtect} = require("../../authmiddleware");

const express = require("express");

const {shop} = require("../../controllers");

const router = express.Router();

router.get("/", shop.getIndex);

router.get("/products", shop.getProducts);

router.get("/product/:productId", shop.getProduct);
router.get("/category/:category", shop.getProductPerCategory);
router.post("/add-to-cart", userRoutesProtect, shop.getAddToCart);
router
  .route("/cart")
  .get(userRoutesProtect, shop.getCart)
  .post(userRoutesProtect, shop.postToCart);

router.post("/cart-delete-item", userRoutesProtect, shop.postCartDeleteProduct);

router.get("/orders", userRoutesProtect, shop.getOrders);

router.post("/create-order", userRoutesProtect, shop.createOrder);

router.get("/orders/:orderId", userRoutesProtect, shop.createInvoicePdf);

// router.get('/checkout', shop.getCheckout);

module.exports = router;
