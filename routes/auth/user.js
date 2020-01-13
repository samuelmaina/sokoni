const express = require("express");

const router = express.Router();

const userAuthControllers = require("../../controllers/auth/user");

const validators=require('../../util/validators/auth');


router.get("/signup", userAuthControllers.getSignUp);
router.post(
  "/signup",validators.userSignUpValidator,
  userAuthControllers.postSignUp
);

router.get("/login", userAuthControllers.getLogin);
router.post("/login",validators.loginValidator, userAuthControllers.postLogin,userAuthControllers.initializeSession);

router.get('/reset',userAuthControllers.getReset);
router.post('/reset',validators.validateReset,userAuthControllers.postReset);

router.get('/newPassword/:token',userAuthControllers.getNewPassword);
router.post('/newPassword',validators.newPasswordValidator,userAuthControllers.postNewPassword);
router.post(
  "/newPassword/newPassword",
  validators.newPasswordValidator,
  userAuthControllers.postNewPassword
);
router.post("/logout", userAuthControllers.postLogout);

module.exports = router;
