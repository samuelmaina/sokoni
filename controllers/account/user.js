const validationErrorsIn = require("../../util/validationResults");

const DASHBOARD_PATH = "/auth/user/dashboard";

exports.getDeposit = (req, res, next) => {
  res.render("accounting/deposit", {
    pageTitle: "Deposit the funds",
    path: "user/deposit",
    postPath: "deposit",
  });
};
exports.postDeposit = async (req, res, next) => {
  try {
    const { amount, paymentMode } = req.body;
    const validationErrors = validationErrorsIn(req);
    if (validationErrors) {
      req.flash("error", validationErrors);
      req.flash("previous-data", req.body);
      return res.redirect("deposit");
    }

    await req.user.incrementAccountBalance(amount);
    req.flash("info", `${amount} successfully credited into your account`);
    res.redirect(DASHBOARD_PATH);
  } catch (error) {
    next(error);
  }
};
