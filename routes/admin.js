
const express = require('express');
const IsAuth=require('../authmiddleware/AdminRoutesProtect');

const adminController = require('../controllers/admin');

const router = express.Router();


router.get('/signup' ,adminController.getAdminSignUp);

router.post('/signup', adminController.postAdminSignUp);

router.get('/login', adminController.getLogin);

router.post('/login', adminController.postLogin);


// /admin/add-product => GET
router.get('/add-product',IsAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products',IsAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',IsAuth, adminController.postAddProduct);

router.get('/edit-product/:productId',IsAuth, adminController.getEditProduct);

router.post('/edit-product',IsAuth, adminController.postEditProduct);

router.post('/delete-product',IsAuth, adminController.postDeleteProduct);

module.exports = router;
