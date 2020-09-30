const express = require("express");
const router = express.Router();
const validators = require("../../util/validators/auth");

const userEditController = require("../../controllers/edit/user");

router.get("/change-details", userEditController.getEditDetails);
router.post(
  "/change-details",
  validators.changeDetailsValidator,
  userEditController.postEditDetails
);
router.get("/change-password", userEditController.getChangePassword);
router.post(
  "/change-password",
  validators.newPasswordValidator,
  userEditController.postChangePassword
);
module.exports = router;
