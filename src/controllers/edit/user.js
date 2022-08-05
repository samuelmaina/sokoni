const { ShortCode } = require("../../database/models");
const {
  Renderer,
  Flash,
  validationResults,
  smsSender,
} = require("../../utils");

const DASHBOARD_PATH = "/auth/user/dashboard";

exports.getEditDetails = (req, res, next) => {
  try {
    return new Renderer(res)
      .templatePath("edit/edit")
      .pageTitle("Change Your Details")
      .appendInfo(
        "For now Email and Tel Number validation is not done but will be done in future."
      )
      .pathToPost("edit/user/change-details")
      .appendPreviousData(req.user)
      .render();
  } catch (error) {
    next(error);
  }
};

exports.validateInputAndGenerateShortCode = async (req, res, next) => {
  try {
    const flash = new Flash(req, res);
    const validationErrors = validationResults(req);
    const currentTel = req.user.tel;
    if (validationErrors) {
      return flash
        .appendError(validationErrors)
        .appendPreviousData(req.body)
        .redirect("change-details");
    }
    const to = req.body.tel;

    // if (currentTel !== to) {
    //   const details = await ShortCode.createOneForId(to);
    //   const shortCode = details.code;
    //   const message = `Your verification code is ${shortCode}`;
    //   await smsSender(message, to);
    //   // await smsSender(message, to);
    //   req.validateTel = true;
    // }
    return next();
  } catch (error) {
    next(error);
  }
};

exports.getInputTelCode = async (req, res, next) => {
  try {
    const flash = new Flash(req, res);
    const { name, email } = req.body;
    await req.user.updateMany({
      name,
      email,
    });
    if (req.validateTel)
      return new Renderer(res)
        .templatePath("edit/verify-tel")
        .pageTitle("Verify Phone Number")
        .pathToPost("edit/user/verify-tel-number")
        .appendInfo("A short code to your phone SMS.")
        .appendPreviousData(req.user)
        .appendDataToResBody({ name: req.user.name, tel: req.body.tel })
        .render();
    return flash
      .appendSuccess(`Details successfully updated`)
      .redirect(DASHBOARD_PATH);
  } catch (error) {
    next(error);
  }
};

exports.saveTel = async (req, res, next) => {
  try {
    const flash = new Flash(req, res);

    const validationErrors = validationResults(req);

    const renderer = new Renderer(res)
      .templatePath("edit/verify-tel")
      .pageTitle("Verify Phone Number")
      .pathToPost("edit/user/verify-tel-number")
      .appendPreviousData(req.user)
      .appendDataToResBody({ name: req.user.name, tel: req.body.tel });

    if (validationErrors) {
      return renderer.appendError(validationErrors).render();
    }
    const { tel, shortCode } = req.body;

    const exists = await ShortCode.findDetailByTelAndCode(tel, shortCode);
    if (exists) {
      await req.user.updateMany(req.body);
      exists.delete();
      return flash
        .appendSuccess(`Details successfully updated`)
        .redirect(DASHBOARD_PATH);
    } else {
      return renderer
        .appendError("You have entered the wrong verification code.")
        .render();
    }
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
    flash
      .appendSuccess("Password successfully updated")
      .redirect(DASHBOARD_PATH);
  } catch (error) {
    next(error);
  }
};
