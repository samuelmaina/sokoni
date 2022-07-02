const assert = require("assert");
const {
  startApp,
  getNewDriverInstance,
  closeApp,
  TEST_PORT,
} = require("./config");
const { clearDb } = require("../utils/generalUtils").database;

const { Auth, utilLogin, generalUtils } = require("./utils");
const { clearSessions } = generalUtils;
const { ensureHasTitleAfterClickingLink, ensureHasTitleAfterClickingId } =
  generalUtils;

const TEST_MAX_TIME = 25000;

const MAX_SETUP_TIME = 30000;

const PORT = TEST_PORT;
const base = `http://localhost:${PORT}`;
const homePage = `${base}/`;
const baseAuth = `${base}/auth/`;
let page;
const data = {
  name: "John Doe",
  email: "johndoe@email.com",
  password: "JohnDoe89??",
};
describe("Nav Links", () => {
  beforeAll(async () => {
    await startApp(PORT);
    page = new Auth(getNewDriverInstance());
  }, TEST_MAX_TIME);
  afterAll(async () => {
    await page.close();
    await clearDb();
    await clearSessions();
    await closeApp();
  });

  describe("Guest Links", () => {
    describe("Admin", () => {
      //reopen homepage incase of failure.
      beforeEach(async () => {
        await page.openUrl(homePage);
        await page.clickLink("Proceed as a seller");
      }, MAX_SETUP_TIME);
      it(
        "SignUp",
        async () => {
          const link = "Sign Up";
          const title = "Admin Sign Up";
          await ensureHasTitleAfterClickingLink(page, link, title);
        },
        TEST_MAX_TIME
      );

      it(
        "Login",
        async () => {
          const link = "Login";
          const title = "Admin Log In";
          await ensureHasTitleAfterClickingLink(page, link, title);
        },
        TEST_MAX_TIME
      );
      describe("contained links", () => {
        const login = `${baseAuth}/admin/log-in`;
        const signUp = `${baseAuth}/admin/sign-up`;
        it(
          "Reset",
          async () => {
            await page.openUrl(login);
            const id = "reset";
            const title = "Admin Reset Password";
            await ensureHasTitleAfterClickingId(page, id, title);
          },
          TEST_MAX_TIME
        );
        it(
          "Sign Up",
          async () => {
            await page.openUrl(login);
            const id = "sign-up";
            const title = "Admin Sign Up";
            await ensureHasTitleAfterClickingId(page, id, title);
          },
          TEST_MAX_TIME
        );

        it(
          "Sign In",
          async () => {
            await page.openUrl(signUp);
            const id = "sign-in";
            const title = "Admin Log In";
            await ensureHasTitleAfterClickingId(page, id, title);
          },
          TEST_MAX_TIME
        );
      });
    });
    describe("User", () => {
      //reopen homepage incase of failure.
      beforeEach(async () => {
        await page.openUrl(homePage);
      }, MAX_SETUP_TIME);
      it(
        "SignUp",
        async () => {
          const link = "Sign Up";
          const title = "User Sign Up";
          await ensureHasTitleAfterClickingLink(page, link, title);
        },
        TEST_MAX_TIME
      );

      it(
        "Login",
        async () => {
          const link = "Login";
          const title = "User Log In";
          await ensureHasTitleAfterClickingLink(page, link, title);
        },
        TEST_MAX_TIME
      );
      describe("contained links", () => {
        const login = `${baseAuth}/user/log-in`;
        const signUp = `${baseAuth}/user/sign-up`;
        it(
          "Reset",
          async () => {
            await page.openUrl(login);
            const id = "reset";
            const title = "User Reset Password";
            await ensureHasTitleAfterClickingId(page, id, title);
          },
          TEST_MAX_TIME
        );
        it(
          "Sign Up",
          async () => {
            await page.openUrl(login);
            const id = "sign-up";
            const title = "User Sign Up";
            await ensureHasTitleAfterClickingId(page, id, title);
          },
          TEST_MAX_TIME
        );

        it(
          "Sign In",
          async () => {
            await page.openUrl(signUp);
            const id = "sign-in";
            const title = "User Log In";
            await ensureHasTitleAfterClickingId(page, id, title);
          },
          TEST_MAX_TIME
        );
      });
    });
  });
  describe("When user Logged In", () => {
    const type = "user";
    const loginUrl = `${baseAuth}/${type}/log-in`;
    beforeAll(async () => {
      await utilLogin(page, loginUrl, data, type);
      const title = await page.getTitle();
      //when user is logged successfully the app redirects to Products.
      assert.strictEqual(
        title,
        "Products",
        new Error("Unable to login the user")
      );
    }, TEST_MAX_TIME);
    afterAll(async () => {
      await clearSessions();
      await clearDb();
    });
    beforeEach(async () => {
      await page.openUrl(homePage);
    });
    it("Products", async () => {
      const link = "Products";
      const title = "Products";
      await ensureHasTitleAfterClickingLink(page, link, title);
    });
    it("Cart", async () => {
      const link = "Cart";
      const title = "Your Cart";
      await ensureHasTitleAfterClickingLink(page, link, title);
    });
    it("Orders", async () => {
      const link = "Orders";
      const title = "Your Orders";
      await ensureHasTitleAfterClickingLink(page, link, title);
    });
    it("Dashboard", async () => {
      const link = "Dashboard";
      const title = "Dashboard";
      await ensureHasTitleAfterClickingLink(page, link, title);
    });
    it(
      "logout",
      async () => {
        await logoutAndReloginReturningTitleAfterLogout(loginUrl, type);
      },
      TEST_MAX_TIME
    ); //needs more time due to the additional log in
  });
  describe("When Admin is Logged In", () => {
    const type = "admin";
    const loginUrl = `${baseAuth}/${type}/log-in`;
    beforeAll(async () => {
      await utilLogin(page, loginUrl, data, type);
      const title = await page.getTitle();

      //when admin is logged successfully the app redirects to "Your Products".
      assert.strictEqual(
        title,
        "Your Products",
        new Error("Unable to login the admin")
      );
    }, TEST_MAX_TIME);
    beforeEach(async () => {
      await page.openUrl(base + "/admin/products");
    });
    afterAll(async () => {
      await clearSessions();
      await clearDb();
    }, TEST_MAX_TIME);

    it(
      "Your Products",
      async () => {
        const link = "Your Products";
        const title = "Your Products";
        await ensureHasTitleAfterClickingLink(page, link, title);
      },
      TEST_MAX_TIME
    );
    it("Add Product", async () => {
      const link = "Add Product";
      const title = "Add Product";

      await ensureHasTitleAfterClickingLink(page, link, title);
    });
    it("See Your Sales", async () => {
      const link = "See Your Sales";
      const title = "Your Sales";
      await ensureHasTitleAfterClickingLink(page, link, title);
    });
    it("logout", async () => {
      await logoutAndReloginReturningTitleAfterLogout(loginUrl, type);
    });
  });
});

const logoutAndReloginReturningTitleAfterLogout = async (loginUrl, type) => {
  const id = "logout";
  const title = "Sokoni Shop";
  await ensureHasTitleAfterClickingId(page, id, title);
  //login again for the next test.This won't be affected by failure of logout
  await utilLogin(page, loginUrl, data, type);
};
