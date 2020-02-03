const ensureUserAuthenticated=require('../authmiddleware/userRoutesProtect')

const express = require('express');

const shopControllers = require('../controllers/shop');

const router = express.Router();

router.get('/', shopControllers.getIndex);

router.get('/products', shopControllers.getProducts);

router.get('/products/:productId', shopControllers.getProduct);

router.get('/cart', ensureUserAuthenticated,shopControllers.getCart);
router.post('/cart', ensureUserAuthenticated,shopControllers.postToCart);

router.post('/cart-delete-item',ensureUserAuthenticated, shopControllers.postCartDeleteProduct);

router.get("/orders", ensureUserAuthenticated, shopControllers.getOrders);

router.post('/create-order', ensureUserAuthenticated,shopControllers.createOrder);


router.get(
  "/orders/:orderId",
  ensureUserAuthenticated,
  shopControllers.createInvoicePdf,
  shopControllers.getInvoice
);

// router.get('/checkout', shopControllers.getCheckout);

module.exports = router;
