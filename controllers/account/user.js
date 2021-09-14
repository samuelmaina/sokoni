const { paymentMethods } = require("../../config/constraints");
const { Flash, Renderer, validationResults } = require("../../utils");

const DASHBOARD_PATH = "/auth/user/dashboard";

exports.getDeposit = (req, res, next) => {
  return new Renderer(res)
    .templatePath("accounting/deposit")
    .pageTitle("Deposit")
    .activePath("/dashboard")
    .appendDataToResBody({
      name: req.user.name,
      options: paymentMethods,
    })
    .pathToPost("deposit")
    .render();
};
exports.postDeposit = async (req, res, next) => {
  try {
    const flash = new Flash(req, res).appendPreviousData(req.body);
    const { amount, paymentMethod } = req.body;
    if (!paymentMethods.includes(paymentMethod)) {
      return flash
        .appendError(
          "No Payment methods selected.Please select a payment method."
        )
        .redirect("deposit");
    }
    const validationErrors = validationResults(req);
    if (validationErrors) {
      return flash.appendError(validationErrors).redirect("deposit");
    }
    await req.user.incrementBalance(amount);
    flash
      .appendInfo(`${amount} successfully credited into your account`)
      .redirect(DASHBOARD_PATH);
  } catch (error) {
    next(error);
  }
};
