const {startApp, getNewDriverInstance} = require("./config");

const {
  clearTheDb,
  createNewAdminWithData,
  createNewUserWithData,
} = require("../utils/generalUtils");
const Page = require("./utils/Auth");

const MAX_SETUP_TIME = 10000;
const MAX_TESTING_TIME = 30000;

const PORT = 5000;
const base = `http://localhost:${PORT}`;
const baseAuth = `${base}/auth`;

const data = {
  name: "Samuel Maina",
  email: "samuelmayna@gmail.com",
  password: "Smaina6891",
};
let page;
describe("E2E tests", () => {
  beforeAll(async () => {
    await startApp();
    await clearTheDb();
    page = new Page(getNewDriverInstance());
  }, MAX_SETUP_TIME);
  afterAll(async () => {
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
          await validateTitleAndInfo(expectedTitle, expectedInfo);
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
        await validateTitleAndError(expectedTitle, expectedErrorMessage);
      });
    });

    describe("-user", () => {
      const signUpUrl = `${baseAuth}/user/sign-up`;
      afterEach(async () => {
        await clearTheDb();
        await page.hold(500);
      }, MAX_SETUP_TIME);
      it("valid credentials", async () => {
        await signUp(signUpUrl, data);
        const expectedTitle = "User Log In";
        await validateTitleAndInfo(expectedTitle, expectedInfo);
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
        await validateTitleAndError(expectedTitle, expectedErrorMessage);
      });
    });
  });

  describe("should Login for both users and admins", () => {
    describe("-admin", () => {
      const logInUrl = `${baseAuth}/admin/log-in`;
      beforeEach(async () => {
        await createNewAdminWithData(data);
      });
      afterEach(async () => {
        await clearTheDb();
        await page.hold(500);
      }, MAX_SETUP_TIME);

      it("valid credentials", async () => {
        await login(logInUrl, data);
        const title = await page.getTitle();
        await logout();
        expect(title).toEqual("Your Products");
      });
      it("invalid credentials", async () => {
        const {password} = data;
        const invalidData = {
          email: "someemail@gmail.com",
          password,
        };
        await login(logInUrl, invalidData);
        const title = await page.getTitle();
        const error = await page.getError();
        expect(error).toEqual("Invalid Email or Password");
        expect(title).toEqual("Admin Log In");
      });
    });
    describe("-user", () => {
      const logInUrl = `${baseAuth}/user/log-in`;
      beforeEach(async () => {
        await createNewUserWithData(data);
      });
      afterEach(async () => {
        await clearTheDb();
        await page.hold(500);
      }, MAX_SETUP_TIME);
      it("valid credentials", async () => {
        await login(logInUrl, data);
        const title = await page.getTitle();
        await logout();
        expect(title).toEqual("Products");
      });
      it("invalid credentials", async () => {
        const {email} = data;
        const invalidData = {
          email,
          password: "somepssword2233",
        };
        await login(logInUrl, invalidData);
        const title = await page.getTitle();
        const error = await page.getError();
        expect(error).toEqual("Invalid Email or Password");
        expect(title).toEqual("User Log In");
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
        await clickReset(resetUrl, data.email);
        const title = await page.getTitle();
        const info = await page.getInfo();
        expect(info).toEqual(
          "A link has been sent to your email. Please click the link to reset password."
        );
        expect(title).toEqual("Admin Log In");
      });
      it("invalid email", async () => {
        const invalidEmail = "samuelmayna@gmail.com123";
        await clickReset(resetUrl, invalidEmail);
        const title = await page.getTitle();
        const info = await page.getInfo();
        expect(info).toEqual("please enter a valid email.");
        expect(title).toEqual("Admin Log In");
      });
    });
  });
});
const validateTitleAndError = async (expectedTitle, expectedErrorMessage) => {
  const title = await page.getTitle();
  const error = await page.getError();
  expect(title).toEqual(expectedTitle);
  expect(error).toEqual(expectedErrorMessage);
};
const validateTitleAndInfo = async (expectedTitle, expectedInfo) => {
  const title = await page.getTitle();
  const info = await page.getInfo();
  expect(title).toEqual(expectedTitle);
  expect(info).toEqual(expectedInfo);
};

const signUp = async (signUpUrl, data) => {
  try {
    await page.openUrl(signUpUrl);
    await page.enterName(data.name);
    await page.enterEmail(data.email);
    await page.enterPassword(data.password);
    await page.enterConfirmPassword(data.password);
    await page.submit("signup");
    await page.hold(500);
  } catch (error) {
    throw new Error(error);
  }
};
const login = async (loginUrl, data) => {
  try {
    await page.openUrl(loginUrl);
    await page.hold(500);

    await page.enterEmail(data.email);
    await page.enterPassword(data.password);

    await page.submit("login");
    await page.hold(500);
  } catch (error) {
    throw new Error(error);
  }
};

const logout = async () => {
  await page.clickById("logout");
  await page.hold(500);
};

const clickReset = async (resetUrl, email) => {
  await page.openUrl(resetUrl);
  await page.hold(500);

  await page.enterEmail(email);

  await page.submit("reset");
  await page.hold(500);
};
