const IsAuth=require('../authmiddleware/userRoutesProtect')

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', IsAuth,shopController.getCart);
router.post('/cart', IsAuth,shopController.postCart);

router.post('/cart-delete-item',IsAuth, shopController.postCartDeleteProduct);

router.get("/orders", IsAuth, shopController.getOrders);

router.post('/create-orders', IsAuth,shopController.postOrders);


router.get('/orders/:orderId',IsAuth,shopController.getInvoice);

// router.get('/checkout', shopController.getCheckout);

module.exports = router;
