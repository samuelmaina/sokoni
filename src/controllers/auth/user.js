const { Renderer } = require("../../utils");

const BaseAuth = require("./base");
const { User } = require("../../database/models");

const changeDetailsPath = "/edit/user/change-details";
const changePasswordPath = "/edit/user/change-password";
const depositPath = "/account/user/deposit";

const navigationData = {
  changeDetailsPath,
  changePasswordPath,
  depositPath,
};

class UserAuth extends BaseAuth {
  constructor(Model, type) {
    super(Model, type);
  }
  async getDashboard(req, res, next) {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);

      return new Renderer(res)
        .templatePath("dashboards/user")
        .pageTitle("Dashboard")
        .activePath("/dashboard")
        .appendDataToResBody({
          user,
          navigationData,
        })
        .render();
    } catch (error) {
      next(error);
    }
  }
}
const user = new UserAuth(User, "user");

module.exports = user;
