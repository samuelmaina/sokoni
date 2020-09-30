const errorHandler = require("../../util/errorHandler");
const validationErrorsIn = require("../../util/validationResults");

const DASHBOARD_PATH = "/auth/user/dashboard";

exports.getEditDetails = (req, res, next) => {
  try {
    return res.render("auth/edit", {
      pageTitle: "Edit Your Details",
      path: "edit/details",
      postPath: "edit/user/change-details",
      previousData: req.user,
    });
  } catch (error) {
    errorHandler(error, next);
  }
};
exports.postEditDetails = async (req, res, next) => {
  try {
    const validationErrors = validationErrorsIn(req);
    if (validationErrors) {
      req.flash("previous-data", req.user);
      req.flash("error", validationErrors);
      return res.redirect("change-details");
    }
    await req.user.updateNameAndEmail(req.body);
    req.flash("info", `Details successfully updated`);
    res.redirect(DASHBOARD_PATH);
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.getChangePassword = (req, res, next) => {
  res.render("auth/newPassword", {
    pageTitle: "Change Password",
    path: "edit/details",
    postPath: "change-password",
    token: null,
    Id: null,
  });
};
exports.postChangePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const validationErrors = validationErrorsIn(req);
    if (validationErrors) {
      req.flash("error", validationErrors);
      req.flash("previous-data", req.body);
      return res.redirect("change-password");
    }

    //check if the submitted password is the same as the one stored in the database.if some,
    //prompt to enter a different password.
    const submittedSamePassword = await req.user.checkIfPasswordIsValid(
      password
    );
    if (submittedSamePassword) {
      const errorMessage = `Password already in use.Please select another one`;
      req.flash("previous-data", req.body);
      req.flash("error", errorMessage);
      return res.redirect("change-password");
    }
    await req.user.resetPasswordTo(password);
    req.flash("info", `Password changed successfully`);
    res.redirect(DASHBOARD_PATH);
  } catch (error) {
    errorHandler(error, next);
  }
};
