const { paymentMethods } = require("../../config/constraints");
const { Flash, Renderer, validationResults } = require("../../utils");

const DASHBOARD_PATH = "/auth/user/dashboard";

const methodsWithoutRegExp = paymentMethods.map((value) => {
  return value.method;
});

exports.getDeposit = (req, res, next) => {
  try {
    return new Renderer(res)
      .templatePath("accounting/deposit")
      .pageTitle("Deposit")
      .activePath("/dashboard")
      .appendDataToResBody({
        name: req.user.name,
        options: methodsWithoutRegExp,
      })
      .pathToPost("deposit")
      .render();
  } catch (error) {
    next(error);
  }
};
exports.validateInput = async (req, res, next) => {
  try {
    const flash = new Flash(req, res).appendPreviousData(req.body);
    const { amount, paymentMethod } = req.body;
    if (!methodsWithoutRegExp.includes(paymentMethod)) {
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
    req.paymentDetails = req.body;
    return next();
  } catch (error) {
    next(error);
  }
};

exports.processPayment = async (req, res, next) => {
  try {
    const method = req.method;
    switch (method) {
      case "M-Pesa":
        const result = await makePaymentWithMpesa(req);
        break;

      default:
        break;
    }
  } catch (error) {
    next(error);
  }
};

exports.creditIntoAccount = async (req, res, next) => {
  try {
    const { amount } = req.paymentDetails;
    await req.user.incrementBalance(amount);
    const flash = new Flash(req, res);
    flash
      .appendSuccess(`${amount} successfully credited into your account`)
      .redirect(DASHBOARD_PATH);
  } catch (error) {
    next(error);
  }
};
