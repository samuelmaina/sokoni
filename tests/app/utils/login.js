const {
  createNewAdminWithData,
  createNewUserWithData,
} = require("../../utils/generalUtils");

/**
 * A utility function that is used to login user.
 * The best way is to direcly create session with the given data(as it is way faster )
 * but that is very tiresome since we have to create our own csurf and cookies  during get request
 * and  provide them when submitting.
 * We will use the current browser instance(named page in this case) to login by entering the
 * credentials. Note that we dont need to create the data first in the database(to simulate sign up)
 * ,this is done in the login using the passed type.
 * @returns the document that is first created.
 *
 */
module.exports = login = async (page, loginUrl, data, type) => {
  let createdDoc;
  try {
    switch (type) {
      case "user":
        createdDoc = await createNewUserWithData(data);
        break;
      case "admin":
        createdDoc = await createNewAdminWithData(data);
        break;
      default:
        break;
    }
    await page.openUrl(loginUrl);
    await page.enterDataByName("email", data.email);
    await page.enterDataByName("password", data.password);
    await page.clickById("login");

    return createdDoc;
  } catch (error) {
    throw new Error(error);
  }
};
