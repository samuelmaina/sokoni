const { Renderer, Flash, validationResults } = require("../../utils");

const DASHBOARD_PATH = "/auth/user/dashboard";

exports.getEditDetails = (req, res, next) => {
  try {
    return new Renderer(res)
      .templatePath("edit/edit")
      .pageTitle("Change Your Details")
      .pathToPost("edit/user/change-details")
      .appendPreviousData(req.user)
      .appendDataToResBody({ name: req.user.name })
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

    await req.user.updateMany(req.body);

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
    const flash = new Flash(req, res).appendPreviousData(req.body);
    const { password } = req.body;
    const validationErrors = validationResults(req);
    if (validationErrors) {
      return flash
        .appendError(validationErrors)
        .redirect("/edit/user/change-password");
    }

    //check if the submitted password is the same as the one stored in the database.if so,
    //prompt to enter a different password.
    const submittedSamePassword = await req.user.isCorrect(password);
    if (submittedSamePassword) {
      const errorMessage = `Password already in use.Please select another one`;
      return flash.appendError(errorMessage).redirect("change-password");
    }
    await req.user.update("password", password);
    flash.appendInfo("Password successfully updated").redirect(DASHBOARD_PATH);
  } catch (error) {
    next(error);
  }
};
