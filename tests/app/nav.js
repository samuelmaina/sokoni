const assert = require("assert");
const {startApp, getNewDriverInstance, getApp} = require("./config");
const {
  createNewUserWithData,
  createNewAdminWithData,
  clearTheDb,
  clearDataFromAModel,
} = require("../utils/generalUtils");
const Page = require("./utils/Auth");

const TEST_MAX_TIME = 25000;

const PORT = 5000;
const base = `http://localhost:${PORT}`;
const homePage = `${base}/`;
const baseAuth = `${base}/auth/`;
let page;
describe("Ensure that all the links on the nav bar are working", () => {
  beforeAll(async () => {
    page = new Page(getNewDriverInstance());
    await startApp();
    await clearTheDb();
  });
  afterAll(async () => {
    await page.close();
  });
  it(
    "homepage",
    async () => {
      try {
        await page.openUrl(homePage);
        const title = await clickLinkAndReturnNewTitle("Shop");
        expect(title).toEqual("SM Online Shop");
      } catch (error) {
        throw new Error(error);
      }
    },
    TEST_MAX_TIME
  ); //so we need to assign it more time for it to complete. //this is the this is the first page to be opened.It will take longer than expected
  describe("Guest links", () => {
    beforeEach(async () => {
      await page.openUrl(homePage);
    });
    it(
      "Login",
      async () => {
        const title = await clickLinkAndReturnNewTitle("Login");
        expect(title).toEqual("User Log In");
      },
      TEST_MAX_TIME
    );
    it(
      "SignUp",
      async () => {
        const title = await clickLinkAndReturnNewTitle("Sign Up");
        expect(title).toEqual("User Sign Up");
      },
      TEST_MAX_TIME
    );
    it(
      "Admin Login",
      async () => {
        const title = await clickLinkAndReturnNewTitle("Admin Login");
        expect(title).toEqual("Admin Log In");
      },
      TEST_MAX_TIME
    );
    it(
      "Admin SignUp",
      async () => {
        const title = await clickLinkAndReturnNewTitle("Admin Sign Up");
        expect(title).toEqual("Admin Sign Up");
      },
      TEST_MAX_TIME
    );
  });
  describe("When user Logged In", () => {
    const logInUrl = `${baseAuth}/user/log-in`;
    const type = "user";
    beforeAll(async () => {
      await login(logInUrl, type);
      const title = await page.getTitle();
      //when user is logged successfully the app redirects to Products.
      assert.equal(title, "Products", new Error("Unable to login the user"));
    }, TEST_MAX_TIME);
    afterAll(async () => {
      try {
        await clearTheDb();
        await clickLogoutAndReturnNewTitle();
        const title = await page.getTitle();
        assert.equal(title, "SM Online Shop", new Error("User not logged out"));
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    }, TEST_MAX_TIME);
    beforeEach(async () => {
      //reload incase the test link fails.
      await page.openUrl(homePage);
    });
    it("Products", async () => {
      try {
        const title = await clickLinkAndReturnNewTitle("Products");
        expect(title).toEqual("Products");
      } catch (error) {
        throw new Error(error);
      }
    });
    it("Cart", async () => {
      try {
        const title = await clickLinkAndReturnNewTitle("Cart");
        expect(title).toEqual("Your Cart");
      } catch (error) {
        throw new Error(error);
      }
    });
    it("Orders", async () => {
      try {
        const title = await clickLinkAndReturnNewTitle("Orders");
        expect(title).toEqual("Your Orders");
      } catch (error) {
        throw new Error(error);
      }
    });
    it("Dashboard", async () => {
      try {
        const title = await clickLinkAndReturnNewTitle("Dashboard");
        expect(title).toEqual("Dashboard");
      } catch (error) {
        throw new Error(error);
      }
    });
    it(
      "logout",
      async () => {
        await logoutAndReloginReturningTitleAfterLogout(logInUrl, type);
      },
      TEST_MAX_TIME
    ); //needs more time due to the additional log in
  });
  describe("When Admin is Logged In", () => {
    const loginUrl = `${baseAuth}/admin/log-in`;
    const type = "admin";
    beforeAll(async () => {
      await login(loginUrl, type);
      const title = await page.getTitle();
      //when admin is logged successfully the app redirects to "Your Products".
      assert.equal(
        title,
        "Your Products",
        new Error("Unable to login the admin")
      );
    });
    beforeEach(async () => {
      await page.openUrl(homePage);
    });
    afterAll(async () => {
      await clearTheDb();
      const title = await clickLogoutAndReturnNewTitle();
      assert.equal(title, "SM Online Shops", new Error("Admin not logged out"));
    }, TEST_MAX_TIME);

    it("Your Products", async () => {
      const title = await clickLinkAndReturnNewTitle("Your Products");
      expect(title).toEqual("Your Products");
    });
    it("Add Product", async () => {
      const title = await clickLinkAndReturnNewTitle("Add Product");
      expect(title).toEqual("Add Product");
    });
    it("See Your Sales", async () => {
      const title = await clickLinkAndReturnNewTitle("See Your Sales");
      expect(title).toEqual("Your Sales");
    });
    it("logout", async () => {
      await logoutAndReloginReturningTitleAfterLogout(loginUrl, type);
    });
  });
});

const logoutAndReloginReturningTitleAfterLogout = async (logInUrl, type) => {
  const title = await clickLogoutAndReturnNewTitle();
  //login again for the next test.This won't be affected by failure of logout
  await login(logInUrl, type);
  await page.hold(500);
  return title;
};

const clickLinkAndReturnNewTitle = async link => {
  await page.clickLink(link);
  const title = await page.getTitle();
  await page.hold(500);
  return title;
};
const login = async (loginUrl, type) => {
  try {
    const data = {
      name: "John Doe",
      email: "samuelmayna@gmail.com",
      password: "Smain68219",
    };
    switch (type) {
      case "user":
        await createNewUserWithData(data);
        break;
      case "admin":
        await createNewAdminWithData(data);
        break;
      default:
        break;
    }
    await page.openUrl(loginUrl);
    await page.hold(500);
    await page.enterEmail(data.email);
    await page.enterPassword(data.password);
    await page.submit("login");
  } catch (error) {
    throw new Error(error);
  }
};
const ensure = exp => {
  assert.ok(exp);
};
const clickLogoutAndReturnNewTitle = async () => {
  await page.clickById("logout");
  const title = await page.getTitle();
  //need to hold a bit longer since we are deleting the session which will take some time.
  await page.hold(700);
  return title;
};
