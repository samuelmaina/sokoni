const {User, Product} = require("../../database/models");
const {startApp, getNewDriverInstance, closeApp} = require("./config");
const {
  clearTheDb,
  clearDataFromAModel,
  confirmPassword,
} = require("../utils/generalUtils");

const {Page, utilLogin, session} = require("./utils");

let page;

const MAX_TEST_PERIOD = 20000;

const PORT = 5000;
const base = `http://localhost:${PORT}`;

const USER_LOGIN_URL = `${base}/auth/user/log-in`;

const USER_LOGIN_DATA = {
  name: "Samuel Maina",
  email: "samuelmayna@gmail.com",
  password: "Smain68219?",
};
describe.skip("logged in user can be able to shop", () => {
  beforeAll(async () => {
    await startApp(PORT);
    page = new Page(getNewDriverInstance());
  });
  afterAll(async () => {
    await session.clearSessions();
    await page.close();
    await clearTheDb();
    await closeApp();
  });

  describe("Clicks", () => {
    beforeAll(async () => {
      await utilLogin(page, USER_LOGIN_URL, USER_LOGIN_DATA, "user");
    }, MAX_TEST_PERIOD);
    beforeEach(async () => {
      await page.openUrl(`${base}/auth/user/dashboard`);
    }, MAX_TEST_PERIOD);
    afterAll(async () => {
      await clearDataFromAModel(User);
    });
    test(
      "can click 'Change Details'",
      async () => {
        await page.clickLink("Change Details");
        await ensureNewTitleIs("Change Your Details");
      },
      MAX_TEST_PERIOD
    );

    test(
      "can click 'Change Password'",
      async () => {
        await page.clickLink("Change Password");
        await ensureNewTitleIs("Change Password");
      },
      MAX_TEST_PERIOD
    );
    test(
      "can click  'Deposit into the Account'",
      async () => {
        await page.clickLink("Deposit into the Account");
        await ensureNewTitleIs("Deposit");
      },
      MAX_TEST_PERIOD
    );
  });
  describe("Modification", () => {
    let user;
    beforeEach(async () => {
      user = await utilLogin(page, USER_LOGIN_URL, USER_LOGIN_DATA, "user");
    });
    afterEach(async () => {
      await session.clearSessions();
      await clearDataFromAModel(User);
    });
    const newData = {
      name: "John Doe",
      email: "johndoe@somedomain.com",
      tel: "0712345678",
      password: "newPassword559??",
    };
    it("can modify name,email and tel", async () => {
      const changeDetailsUrl = `${base}/edit/user/change-details`;
      await page.openUrl(changeDetailsUrl);

      await page.enterDataByName("name", newData.name);
      await page.enterDataByName("email", newData.email);
      await page.enterDataByName("tel", newData.tel);

      await page.clickById("change-details");

      //after successful updation, user is redirected to the Dashboard.
      await ensureNewTitleIs("Dashboard");

      await ensureInfoIs("Details successfully updated");

      //verify that the data is also changed in the database.
      const {name, email, tel} = await fetchUserDataFromDatabase();
      expect(name).toEqual(newData.name);
      expect(email).toEqual(newData.email);
      expect(tel).toEqual(newData.tel);
    });
    test("can modify password", async () => {
      const changePasswordUrl = `${base}/edit/user/change-password`;
      await page.openUrl(changePasswordUrl);

      await page.enterDataByName("password", newData.password);
      await page.enterDataByName("confirmPassword", newData.password);

      await page.clickById("change-password");

      //same as successful details updation.
      await ensureNewTitleIs("Dashboard");
      await ensureInfoIs("Password successfully updated");

      const {password} = await fetchUserDataFromDatabase();
      const passwordIsOfNewData = await confirmPassword(
        newData.password,
        password
      );
      expect(passwordIsOfNewData).toBeTruthy();
    });
    test("can deposit into account", async () => {
      const changePasswordUrl = `${base}/edit/user/change-password`;
      await page.openUrl(changePasswordUrl);

      await page.enterDataByName("password", newData.password);
      await page.enterDataByName("confirmPassword", newData.password);

      await page.clickById("change-password");

      //same as successful details updation.
      await ensureNewTitleIs("Dashboard");
      await ensureInfoIs("Password successfully updated");

      const {password} = await fetchUserDataFromDatabase();
      const passwordIsOfNewData = await confirmPassword(
        newData.password,
        password
      );
      expect(passwordIsOfNewData).toBeTruthy();
    });

    const fetchUserDataFromDatabase = async () => {
      return await User.findById(user.id);
    };
  });
});

const ensureNewTitleIs = async expectedTitle => {
  const title = await page.getTitle();
  expect(title).toEqual(expectedTitle);
};

const ensureInfoIs = async expectedInfo => {
  const info = await page.getInfo();
  expect(info).toEqual(expectedInfo);
};
