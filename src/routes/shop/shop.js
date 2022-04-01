const { ensureUserIsAuth } = require("../../middlewares/auth");

const express = require("express");

const { shop } = require("../../controllers");
const { productQuery, product } = require("../../validators");

const router = express.Router();

const { pageV, categoryV } = productQuery;

router.get("/", shop.getIndex);

router.get("/products", pageV, shop.getProducts);

router.get("/product/:productId", shop.getProduct);
router.get("/category/:category", categoryV, shop.getProductsPerCategory);
router.post("/add-to-cart", ensureUserIsAuth, shop.getAddToCart);
router
  .route("/cart")
  .get(ensureUserIsAuth, shop.getCart)
  .post(product.quantity, ensureUserIsAuth, shop.postToCart);

router.post("/cart-delete-item", ensureUserIsAuth, shop.postCartDeleteProduct);

router.get("/orders", ensureUserIsAuth, shop.getOrders);

router.post("/create-order", ensureUserIsAuth, shop.createOrder);

router.get("/orders/:orderId", ensureUserIsAuth, shop.createInvoicePdf);

module.exports = router;
