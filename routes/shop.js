const IsAuth=require('../authmiddleware/userRoutesProtect')

const express = require('express');

const shopControllers = require('../controllers/shop');

const router = express.Router();

router.get('/', shopControllers.getIndex);

router.get('/products', shopControllers.getProducts);

router.get('/products/:productId', shopControllers.getProduct);

router.get('/cart', IsAuth,shopControllers.getCart);
router.post('/cart', IsAuth,shopControllers.postToCart);

router.post('/cart-delete-item',IsAuth, shopControllers.postCartDeleteProduct);

router.get("/orders", IsAuth, shopControllers.getOrders);

router.post('/create-order', IsAuth,shopControllers.createOrder);


router.get(
  "/orders/:orderId",
  IsAuth,
  shopControllers.createInvoicePdf,
  shopControllers.getInvoice
);

// router.get('/checkout', shopControllers.getCheckout);

module.exports = router;
