const BaseAuth = require("./base");
const { User } = require("../../database/interfaces/auth");

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
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      res.render("dashboards/user", {
        pageTitle: "Your dashboard",
        path: "/board",
        postPath: "/update-details",
        userData: user,
        navigationData,
      });
    } catch (error) {
      next(error);
    }
  }
}
const user = new UserAuth(User, "user");

module.exports = user;
