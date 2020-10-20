const {Renderer, Flash, validationResults} = require("../../util");

const DASHBOARD_PATH = "/auth/user/dashboard";

exports.getEditDetails = (req, res, next) => {
  try {
    const {name, email} = req.user;
    return new Renderer(res)
      .templatePath("auth/edit")
      .pageTitle("Edit Details")
      .pathToPost("edit/user/change-details")
      .appendPreviousData({name, email})
      .render();
  } catch (error) {
    next(error);
  }
};
exports.postEditDetails = async (req, res, next) => {
  try {
    const flash = new Flash(req, res);
    const validationErrors = validationResults(req);
    if (validationErrors) {
      return flash
        .appendError(validationErrors)
        .appendPreviousData(req.body)
        .redirect("change-details");
    }
    await req.user.updateNameAndEmail(req.body);
    flash.appendInfo(`Details successfully updated`).redirect(DASHBOARD_PATH);
  } catch (error) {
    next(error);
  }
};

exports.getChangePassword = (req, res, next) => {
  return new Renderer(res)
    .templatePath("auth/newPassword")
    .pageTitle("Change Password")
    .appendDataToResBody({
      token: null,
      Id: null,
    })
    .pathToPost("/edit/user/change-password")
    .render();
};
exports.postChangePassword = async (req, res, next) => {
  try {
    const flash = new Flash(req, res);
    const {password} = req.body;
    const validationErrors = validationResults(req);
    if (validationErrors) {
      return flash
        .appendPreviousData(req.body)
        .appendError(validationErrors)
        .redirect("/edit/user/change-password");
    }

    //check if the submitted password is the same as the one stored in the database.if some,
    //prompt to enter a different password.
    const submittedSamePassword = await req.user.checkIfPasswordIsValid(
      password
    );
    if (submittedSamePassword) {
      const errorMessage = `Password already in use.Please select another one`;
      return flash
        .appendError(errorMessage)
        .appendPreviousData(req.body)
        .redirect("change-password");
    }
    await req.user.resetPasswordTo(password);
    flash.appendInfo(`Password changed successfully`).redirect(DASHBOARD_PATH);
  } catch (error) {
    next(error);
  }
};
