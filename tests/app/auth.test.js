const {startApp, closeApp, getNewDriverInstance} = require("./config");

const {
  clearTheDb,
  createNewAdminWithData,
  createNewUserWithData,
} = require("../utils/generalUtils");
const {Auth, session, utilLogin} = require("./utils");

const MAX_SETUP_TIME = 3000;
const MAX_TESTING_TIME = 30000;

const PORT = 8080;
const base = `http://localhost:${PORT}`;
const baseAuth = `${base}/auth`;

const data = {
  name: "Samuel Maina",
  email: "samuelmayna@gmail.com",
  password: "Smaina6891",
};
let page;
describe.skip("Auth", () => {
  beforeAll(async () => {
    await startApp(PORT);
    page = await new Auth(getNewDriverInstance());
  }, MAX_SETUP_TIME);
  afterAll(async () => {
    await closeApp();
    await page.close();
  });

  describe("should sign up for both users and admins", () => {
    //Since we are using data above to sign up both user and admin,their
    //successful sign up message are the same.
    const expectedInfo = `Dear ${data.name}, You have successfully signed up`;

    describe("-admin", () => {
      const signUpUrl = `${baseAuth}/admin/sign-up`;
      afterEach(async () => {
        await clearTheDb();
      });
      it(
        "valid credentials",
        async () => {
          await signUp(signUpUrl, data);
          const expectedTitle = "Admin Log In";
          await ensureHasTitleAndInfo(expectedTitle, expectedInfo);
        },
        MAX_TESTING_TIME
      );
      it("invalid credentials", async () => {
        const {email, password} = data;
        const invalidNameData = {
          name: "Sam",
          password,
          email,
        };
        await signUp(signUpUrl, invalidNameData);
        const expectedErrorMessage =
          "Name too short or it contains symbols.Enter only alphanumerics.";
        const expectedTitle = "Admin Sign Up";
        await ensureHasTitleAndError(expectedTitle, expectedErrorMessage);
      });
    });

    describe("-user", () => {
      const signUpUrl = `${baseAuth}/user/sign-up`;
      afterEach(async () => {
        await clearTheDb();
      }, MAX_SETUP_TIME);
      it("valid credentials", async () => {
        await signUp(signUpUrl, data);
        const expectedTitle = "User Log In";
        await ensureHasTitleAndInfo(expectedTitle, expectedInfo);
      });
      it("invalid credentials", async () => {
        const {name, password} = data;
        const invalidEmailData = {
          name,
          password,
          email: "samuelmayna.@gmail.com123",
        };
        await signUp(signUpUrl, invalidEmailData);
        const expectedTitle = "User Sign Up";
        const expectedErrorMessage = "Please enter a valid email";
        await ensureHasTitleAndError(expectedTitle, expectedErrorMessage);
      });
    });
  });

  describe("should Login for both users and admins", () => {
    //error thrown for any unsuccessful login.
    const error = "Invalid Email or Password";
    afterEach(async () => {
      await session.clearSessions();
    });
    describe("-admin", () => {
      const logInUrl = `${baseAuth}/admin/log-in`;
      beforeEach(async () => {
        await createNewAdminWithData(data);
      });
      afterEach(async () => {
        await clearTheDb();
      }, MAX_SETUP_TIME);

      it("valid credentials", async () => {
        await login(logInUrl, data);
        const title = await page.getTitle();
        expect(title).toEqual("Your Products");
      });
      it("invalid credentials", async () => {
        const {password} = data;
        const invalidData = {
          email: "someemail@gmail.com",
          password,
        };
        await login(logInUrl, invalidData);
        const title = "Admin Log In";
        await ensureHasTitleAndError(title, error);
      });
    });
    describe("-user", () => {
      const logInUrl = `${baseAuth}/user/log-in`;
      beforeEach(async () => {
        await createNewUserWithData(data);
      });
      afterEach(async () => {
        await clearTheDb();
      }, MAX_SETUP_TIME);
      it("valid credentials", async () => {
        await login(logInUrl, data);
        const title = await page.getTitle();
        expect(title).toEqual("Products");
      });
      it("invalid credentials", async () => {
        const {email} = data;
        const invalidData = {
          email,
          password: "somepssword2233",
        };
        await login(logInUrl, invalidData);
        const title = "User Log In";
        await ensureHasTitleAndError(title, error);
      });
    });
  });
  describe("Can click reset and submit reset email", () => {
    describe("admin", () => {
      const resetUrl = `${baseAuth}/admin/reset`;
      beforeEach(async () => {
        await createNewAdminWithData(data);
      });
      afterEach(async () => {
        await clearTheDb();
      });
      it("valid email", async () => {
        await reset(resetUrl, data.email);
        const title = "Admin Log In";
        const info =
          "A link has been sent to your email. Please click the link to reset password.";
        await ensureHasTitleAndInfo(title, info);
      });
      it("invalid email", async () => {
        const invalidEmail = "samuelmayna@gmail.com123";
        await reset(resetUrl, invalidEmail);
        const title = "Admin Reset Password";
        const error = "Please enter a valid email.";
        await ensureHasTitleAndError(title, error);
      });
    });
    describe("user", () => {
      const resetUrl = `${baseAuth}/user/reset`;
      beforeEach(async () => {
        await createNewUserWithData(data);
      });
      afterEach(async () => {
        await clearTheDb();
      });
      it("valid email", async () => {
        await reset(resetUrl, data.email);
        const title = "User Log In";
        const info =
          "A link has been sent to your email. Please click the link to reset password.";
        await ensureHasTitleAndInfo(title, info);
      });
      it("invalid email", async () => {
        const invalidEmail = "samuelmayna@gmail.com123";
        await reset(resetUrl, invalidEmail);
        const title = "User Reset Password";
        const error = "Please enter a valid email.";
        await ensureHasTitleAndError(title, error);
      });
    });
  });
});
const ensureHasTitleAndError = async (expectedTitle, expectedErrorMessage) => {
  const title = await page.getTitle();
  const error = await page.getError();
  expect(title).toEqual(expectedTitle);
  expect(error).toEqual(expectedErrorMessage);
};

const ensureHasTitleAndInfo = async (expectedTitle, expectedInfo) => {
  const title = await page.getTitle();
  const info = await page.getInfo();
  expect(title).toEqual(expectedTitle);
  expect(info).toEqual(expectedInfo);
};

const signUp = async (signUpUrl, data) => {
  await page.openUrl(signUpUrl);

  await page.enterName(data.name);
  await page.enterEmail(data.email);
  await page.enterPassword(data.password);
  await page.enterConfirmPassword(data.password);

  await page.submit("signup");
};
const login = async (loginUrl, data) => {
  await page.openUrl(loginUrl);

  await page.enterEmail(data.email);
  await page.enterPassword(data.password);
  await page.submit("login");
};

const reset = async (resetUrl, email) => {
  await page.openUrl(resetUrl);
  await page.enterEmail(email);
  await page.submit("reset");
};
