const {Flash, Renderer, validationResults} = require("../../utils");

const DASHBOARD_PATH = "/auth/user/dashboard";

exports.getDeposit = (req, res, next) => {
  return new Renderer(res)
    .templatePath("accounting/deposit")
    .pageTitle("Deposit the funds")
    .activePath("/dashboard")
    .pathToPost("deposit")
    .render();
};
exports.postDeposit = async (req, res, next) => {
  try {
    const flash = new Flash(req, res).appendPreviousData(req.body);
    const {amount, paymentMode} = req.body;
    const validationErrors = validationResults(req);
    if (validationErrors) {
      return flash.appendError(validationErrors).redirect("deposit");
    }

    await req.user.incrementAccountBalance(amount);
    flash
      .appendInfo(`${amount} successfully credited into your account`)
      .redirect(DASHBOARD_PATH);
  } catch (error) {
    next(error);
  }
};
