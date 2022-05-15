const { Flash } = require("../../utils");

module.exports = (req, res, next) => {
  try {
    const url = `/auth/admin/log-in`;
    if (!(req.session && req.session.isAdminLoggedIn)) {
      return new Flash(req, res)
        .appendInfo("Your are required to log in to continue")
        .redirect(url);
    }
    next();
  } catch (error) {
    next(error);
  }
};
