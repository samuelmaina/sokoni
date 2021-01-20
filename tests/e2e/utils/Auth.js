const Page = require("./Page");
class Auth extends Page {
  constructor(driver) {
    super(driver);
  }
  async enterName(data) {
    await super.enterDataByName("name", data);
  }
  async enterEmail(data) {
    await super.enterDataByName("email", data);
  }
  async enterPassword(data) {
    await super.enterDataByName("password", data);
  }
  async enterConfirmPassword(data) {
    await super.enterDataByName("confirmPassword", data);
  }
  async submit(submitId) {
    await super.clickById(submitId);
  }
}
module.exports = Auth;
