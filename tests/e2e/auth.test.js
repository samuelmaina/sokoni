const requires = require("../utils/requires");

const { TokenGenerator, EmailToken } = requires.Models;
const ranges = requires.constrains.base;

const {
  startApp,
  closeApp,
  getNewDriverInstance,
  TEST_PORT,
} = require("./config");

const { generateStringSizeN } = require("../utils/generalUtils/utils");

const { clearDb, createDocForType, confirmPassword, fetchByIdForType } =
  require("../utils/generalUtils").database;

const { verifyNull } = require("./../utils/testsUtils");
const { Auth, generalUtils } = require("./utils");

const { ensureHasTitleAndError, ensureHasTitleAndInfo, ensureHasTitle } =
  generalUtils;

const MAX_SETUP_TIME = 25000;
const MAX_TESTING_TIME = 20000;

const PORT = TEST_PORT;
const base = `http://localhost:${PORT}`;
const baseAuth = `${base}/auth`;

const data = {
  name: "John Doe",
  email: "samuelmayna@gmail.com",
  password: "JonDoe34?@",
};
let page;

describe("Auth", () => {
  beforeAll(async () => {
    await startApp(PORT);
    page = await new Auth(getNewDriverInstance());
  }, MAX_SETUP_TIME);
  afterAll(async () => {
    await page.close();
    await clearDb();
    await closeApp();
  });

  describe("Admin should be able to navigate to the admin portal.", () => {
    it(
      "should be able to access the admin portal.",
      async () => {
        await page.openUrl(base);
        await page.clickLink("Proceed as a seller");
        await ensureHasTitle(page, "Admin Actions");
      },
      MAX_TESTING_TIME
    );
    it(
      "should be able to click login.",
      async () => {
        await page.openUrl(base + "/admin");
        await page.clickLink("Login");
        await ensureHasTitle(page, "Admin Log In");
      },
      MAX_TESTING_TIME
    );
    it(
      "should be able to click Sign Up.",
      async () => {
        await page.openUrl(base + "/admin");
        await page.clickLink("Sign Up");
        await ensureHasTitle(page, "Admin Sign Up");
      },
      MAX_TESTING_TIME
    );
  });

  describe("Sign Up", () => {
    describe(`Admin`, () => {
      let url = `${baseAuth}/admin/sign-up`;
      signUpTester("Admin", url);
    });
    describe("User", () => {
      let url = `${baseAuth}/user/sign-up`;
      signUpTester("User", url);
    });
  });
  describe("Log In", () => {
    describe("Admin", () => {
      let logInUrl = `${baseAuth}/admin/log-in`;
      //this is the title of the redirected page after successful login.
      let redirectPageTitle = "Your Products";
      loginTester("Admin", logInUrl, redirectPageTitle);
    });
    describe("User", () => {
      const logInUrl = `${baseAuth}/user/log-in`;
      const redirectPageTitle = "Products";
      loginTester("User", logInUrl, redirectPageTitle);
    });
  });
  describe("Reset", () => {
    describe(
      "Admin",
      () => {
        const resetUrl = `${baseAuth}/admin/reset`;
        resetTester(resetUrl, "Admin");
      },
      MAX_SETUP_TIME
    );
    describe("User", () => {
      const resetUrl = `${baseAuth}/user/reset`;
      resetTester(resetUrl, "User");
    });
  });
  describe("New Password", () => {
    describe("Admin", () => {
      newPasswordTester("Admin");
    });
    describe("User", () => {
      newPasswordTester("User");
    });
  });
});
function signUpTester(type, url) {
  beforeEach(async () => {
    await page.openUrl(url);
  }, MAX_SETUP_TIME);
  afterEach(async () => {
    await clearDb();
  });
  describe("Valid Credentials", () => {
    const expectedTitle = `${type} Log In`;

    it(
      "valid credentials and valid token",
      async () => {
        await signUp(url, data);

        await ensureHasTitle(page, expectedTitle);
        const tokenDetails = await findTokenDetailsForEmail(data.email);
        await page.openUrl(
          `${base}/auth/${generateUrlName(type)}/confirm-email/${
            tokenDetails.token
          }`
        );
        await ensureHasTitleAndInfo(
          page,
          `${type} Log In`,
          "Email confirmation succcessful."
        );

        //ensure that the token details are also deleted from the database.
        verifyNull(await findTokenDetailsForEmail(data.email));
      },
      MAX_TESTING_TIME
    );

    it(
      "valid credentials and invalid token",
      async () => {
        await signUp(url, data);

        await ensureHasTitle(page, expectedTitle);
        await page.openUrl(
          `${base}/auth/${generateUrlName(
            type
          )}/confirm-email/${generateStringSizeN(64)}`
        );
        await ensureHasTitleAndError(
          page,
          `${type} Sign Up`,
          "Too late for confirmation or the token is incorrect. Please try again."
        );
      },
      MAX_TESTING_TIME
    );
  });

  it(
    "Invalid credentials",
    async () => {
      const { email, password } = data;

      const { minlength, error } = ranges.name;
      const invalidNameData = {
        name: generateStringSizeN(minlength - 1),
        password,
        email,
      };
      await signUp(url, invalidNameData);
      const expectedTitle = `${type} Sign Up`;
      await ensureHasTitleAndError(page, expectedTitle, error);
    },
    MAX_TESTING_TIME
  );
  it("should not sign up when email already existing in db.", async () => {
    await createDocForType(type, data);
    await signUp(url, data);
    const error = "Email already exists.Please try another one.";
    const title = `${type} Sign Up`;
    await ensureHasTitleAndError(page, title, error);
  });
}

async function findTokenDetailsForEmail(email) {
  return await EmailToken.findOne({ email });
}
function loginTester(type, url, redirectTitle) {
  const error = "Invalid Email or Password";
  const errorTitle = `${type} Log In`;
  const { password, email } = data;

  beforeEach(async () => {
    await createDocForType(type, data);
  });
  afterEach(async () => {
    await generalUtils.clearSessions();
    await clearDb();
  });
  it(
    "Correct credentials",
    async () => {
      await login(url, data);
      await ensureHasTitle(page, redirectTitle);
    },
    //if this desc block is run alone (using .only),
    //the browser takes some time to open ,as such
    //the first test in the block(this test) needs more time.
    //The others don't need the time as the browser is already set in this test.
    MAX_TESTING_TIME
  );
  it("should throw for invalid credentials ", async () => {
    const data = {
      email: "johndoe@email.com123",
      password,
    };
    await login(url, data);
    ensureHasTitleAndError(page, errorTitle, "Please enter a valid email.");
  });
  describe("Incorrect credentials", () => {
    it("incorrect email and correct password.", async () => {
      const invalidData = {
        email: "someemail@email.com",
        password,
      };
      await login(url, invalidData);
      await ensureHasTitleAndError(page, errorTitle, error);
    });
    it("correct email and incorrect password.", async () => {
      const invalidData = {
        email,
        password: "SomeRandom123@.",
      };
      await login(url, invalidData);
      await ensureHasTitleAndError(page, errorTitle, error);
    });
  });
}

function resetTester(url, type) {
  beforeEach(async () => {
    await createDocForType(type, data);
  });
  afterEach(async () => {
    await clearDb();
  });

  it(
    "valid  existing email",
    async () => {
      await reset(url, data.email);
      const title = `${type} Log In`;
      const info =
        "Reset Successful.A link has been sent to your email. Please click the link to reset password.If mail is not in the inbox, look at the spam folder.";
      await ensureHasTitleAndInfo(page, title, info);
    },
    MAX_TESTING_TIME
  );
  it("valid non-existing email", async () => {
    const nonExisting = "random@email.com";
    await reset(url, nonExisting);
    const title = `${type} Reset Password`;
    const error = `No ${type} by that email exists.`;
    await ensureHasTitleAndError(page, title, error);
  });
  it("invalid email", async () => {
    const invalidEmail = "johndoe@email.com123";
    await reset(url, invalidEmail);
    const title = `${type} Reset Password`;
    const error = "Please enter a valid email.";
    await ensureHasTitleAndError(page, title, error);
  });
}
function newPasswordTester(type) {
  const password = "johnD45?";
  const passwords = {
    password,
    confirmPassword: password,
  };

  let doc;
  beforeEach(async () => {
    doc = await createDocForType(type, data);
  });
  afterEach(async () => {
    await clearDb();
  });
  it(
    "should change password when token is valid",
    async () => {
      const { token } = await EmailToken.createOneForEmail(doc.email);
      const url = `${base}/auth/${generateUrlName(type)}/new-password/${token}`;
      await enterNewPassword(url, passwords);
      await ensureHasTitleAndInfo(
        page,
        `${type} Log In`,
        "Password reset successful."
      );
      const id = doc.id;
      const savedDoc = await fetchByIdForType(type, id);

      //ensure that the password is also changed in the database.
      const passwordIsNewPassword = await confirmPassword(
        password,
        savedDoc.password
      );
      expect(passwordIsNewPassword).toBeTruthy();

      //ensure that the token is also deleted from the database after successful password reset.
      expect(await EmailToken.findTokenDetailsByToken(token)).toBeNull();
    },
    MAX_TESTING_TIME
  );
  it("should throw when token is invalid", async () => {
    const error = "Too late for reset. Please try again.";
    const token = generateStringSizeN(64);
    const url = `${base}/auth/${generateUrlName(type)}/new-password/${token}`;
    await page.openUrl(url);
    await ensureHasTitleAndError(page, `${type} Reset Password`, error);
  });

  it("should throw when resetting to the old password", async () => {
    const error = "Can not reset to your old Password! Select another one";
    const { token } = await TokenGenerator.createOneForId(doc.id);
    const url = `${base}/auth/${generateUrlName(type)}/new-password/${token}`;
    const { password } = data;
    const passwords = {
      password,
      confirmPassword: password,
    };
    await enterNewPassword(url, passwords);
    await page.hold(5000);
    await ensureHasTitleAndError(page, `New Password`, error);
  });
}

async function signUp(signUpUrl, data) {
  await page.openUrl(signUpUrl);

  await page.enterName(data.name);
  await page.enterEmail(data.email);
  await page.enterPassword(data.password);
  await page.enterConfirmPassword(data.password);
  await page.submit("signup");
}
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
const enterNewPassword = async (url, passwords) => {
  //this is the url that is sent via email wheere the user
  //will click so as to set a new password.
  await page.openUrl(url);
  await page.enterDataByName("password", passwords.password);
  await page.enterDataByName("confirmPassword", passwords.confirmPassword);
  await page.clickById("change-password");
};
function generateUrlName(type) {
  switch (type) {
    case "Admin":
      return "admin";
      break;
    case "User":
      return "user";
      break;
    default:
      throw new Error("Invalid type");
  }
}
