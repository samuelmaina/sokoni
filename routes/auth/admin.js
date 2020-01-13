const express = require("express");
const adminAuthController = require("../../controllers/auth/admin");
const router = express.Router();
const validators = require("../../util/validators/auth");

router.get("/signup", adminAuthController.getAdminSignUp);
router.post(
  "/signup",
  validators.adminSignUpValidator,
  adminAuthController.postAdminSignUp
);

router.get("/login", adminAuthController.getLogin);
router.post("/login", validators.loginValidator, adminAuthController.postLogin,adminAuthController.initializeSession);

router.get("/reset", adminAuthController.getReset);
router.post("/reset", validators.validateReset,adminAuthController.postReset);

router.get("/newPassword/:token", adminAuthController.getNewPassword);
router.post("/newPassword",validators.newPasswordValidator, adminAuthController.postNewPassword);


// come to look at this later 
router.post(
  "/newPassword/newPassword",
  validators.newPasswordValidator,
  adminAuthController.postNewPassword
);

router.post("/logout", adminAuthController.postLogout);

module.exports = router;
