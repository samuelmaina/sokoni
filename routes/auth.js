const express= require('express');
const router= express.Router();
const AuthControllers=require('../controllers/auth');

router.get('/login',AuthControllers.getLogin);
router.post('/login',AuthControllers.postLogin);
router.post('/logout',AuthControllers.postLogout);
router.get('/signup',AuthControllers.getSignUp);
module.exports=router;