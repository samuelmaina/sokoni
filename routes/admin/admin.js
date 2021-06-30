const express = require('express');

const { admin } = require('../../controllers');

const { product } = require('../../validators');
const productValidtor = product.productValidator;

const controller = admin;

const router = express.Router();

router
	.route('/add-product')
	.get(controller.getAddProduct)
	.post(productValidtor, controller.postAddProduct);

router.get('/edit-product/:id', controller.getEditProduct);
router.post('/edit-product', productValidtor, controller.postEditProduct);

router.get('/products', controller.getProducts);
router.delete('/product/:id', controller.deleteProduct);
router.get('/get-admin-sales', controller.getAdminSales);

module.exports = router;
