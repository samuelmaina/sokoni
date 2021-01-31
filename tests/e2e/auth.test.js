const { TokenGenerator, User, Admin } = require("../../database/models");

const { startApp, closeApp, getNewDriverInstance } = require("./config");

const ranges = require("../../config/constraints").base;
const {
  generateStringSizeN,
  generateMongooseId,
} = require("../utils/generalUtils");
const { verifyEqual, verifyTruthy } = require("../utils/testsUtils");

const {
  clearTheDb,
  createNewAdminWithData,
  createNewUserWithData,
  confirmPassword,
} = require("../utils/generalUtils");
const { Auth, session } = require("./utils");

const MAX_SETUP_TIME = 25000;
const MAX_TESTING_TIME = 20000;

const PORT = 8080;
const base = `http://localhost:${PORT}`;
const baseAuth = `${base}/auth`;

const data = {
  name: "Samuel Maina",
  email: "samuelmayna@gmail.com",
  password: "Smaina6891?",
};
let page;
describe("Auth", () => {
  beforeAll(async () => {
    await startApp(PORT);
    page = await new Auth(getNewDriverInstance());
  });
  afterAll(async () => {
    await page.close();
    await clearTheDb();
    await closeApp();
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
    describe("Admin", () => {
      const resetUrl = `${baseAuth}/admin/reset`;
      resetTester(resetUrl, "Admin");
    });
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

  function theGoodThing() {
    // const newPassword = "Smain5885:?";
    // const passwords = {
    //   password: newPassword,
    //   confirmPassword: newPassword,
    // };
    // const tokenDetails = await TokenGenerator.findOne({
    //   requesterId: adminId,
    // });
    // await enterNewPassword(tokenDetails.token, "admin", passwords);
    // await ensureHasTitleAndInfo(
    //   "Admin Log In",
    //   "Password reset successful"
    // );
    // // ensure that the password is  also changed in the database.
    // const {password} = await fetchDataFromModelById(Admin, adminId);
    // await expect(
    //   confirmPassword(passwords.password, password)
    // ).resolves.toBeTruthy();
    // await expect(
    //   TokenGenerator.findOne({
    //     requesterId: adminId,
    //   })
    // ).resolves.toBeNull();
  }
  //   describe("user", () => {
  //     const resetUrl = `${baseAuth}/user/reset`;
  //     let user;
  //     beforeEach(async () => {
  //       user = await createNewUserWithData(data);
  //     });
  //     afterEach(async () => {
  //       await clearTheDb();
  //     });
  //     it("valid email", async () => {
  //       const userId = user.id;
  //       await reset(resetUrl, data.email);
  //       const title = "User Log In";
  //       const info =
  //         "A link has been sent to your email. Please click the link to reset password.";
  //       ensureHasTitleAndInfo(title, info);
  //       const tokenDetails = await TokenGenerator.findOne({
  //         requesterId: userId,
  //       });
  //       await page.hold(200);
  //       await enterNewPassword(tokenDetails.token, "user", passwords);
  //       await ensureHasTitleAndInfo("User Log In", "Password reset successful");
  //       // ensure that the password is  also changed in the database.
  //   
  //     });
  //     it("invalid email", async () => {
  //       const invalidEmail = "samuelmayna@gmail.com123";
  //       await reset(resetUrl, invalidEmail);
  //       const title = "User Reset Password";
  //       const error = "Please enter a valid email.";
  //       await ensureHasTitleAndError(title, error);
  //     });
  //   });
  // });
});
function signUpTester(type, url) {
  const expectedInfo = `Dear ${data.name}, You have successfully signed up.`;

  beforeEach(async () => {
    await page.openUrl(url);
  }, MAX_SETUP_TIME);
  afterEach(async () => {
    await clearTheDb();
  });
  it(
    "valid credentials",
    async () => {
      await signUp(url, data);
      const expectedTitle = `${type} Log In`;
      await ensureHasTitleAndInfo(expectedTitle, expectedInfo);
    },
    MAX_TESTING_TIME
  );
  it("Invalid credentials", async () => {
    const { email, password } = data;

    const { minlength, error } = ranges.name;
    const invalidNameData = {
      name: generateStringSizeN(minlength - 1),
      password,
      email,
    };
    await signUp(url, invalidNameData);
    const expectedTitle = `${type} Sign Up`;
    await ensureHasTitleAndError(expectedTitle, error);
  });

  it("should not sign up when email already existing in db.", async () => {
    switch (type) {
      case "Admin":
        await createNewAdminWithData(data);
        break;
      case "User":
        await createNewUserWithData(data);
        break;
      default:
        break;
    }
    await signUp(url, data);
    const error = "Email already exists.Please try another one.";
    const title = `${type} Sign Up`;
    await ensureHasTitleAndError(title, error);
  });
}
function loginTester(type, url, redirectTitle) {
  const error = "Invalid Email or Password";
  const errorTitle = `${type} Log In`;
  const { password, email } = data;

  beforeEach(async () => {
    await createDocForType(type);
  });
  afterEach(async () => {
    await session.clearSessions();
    await clearTheDb();
  });
  it(
    "Correct credentials",
    async () => {
      await login(url, data);
      const title = await page.getTitle();
      expect(title).toEqual(redirectTitle);
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
    ensureHasTitleAndError(errorTitle, "Please enter a valid email.");
  });
  describe("Incorrect credentials", () => {
    it("incorrect email and correct password.", async () => {
      const invalidData = {
        email: "someemail@gmail.com",
        password,
      };
      await login(url, invalidData);
      await ensureHasTitleAndError(errorTitle, error);
    });
    it("correct email and incorrect password.", async () => {
      const invalidData = {
        email,
        password: "SomeRandom123@.",
      };
      await login(url, invalidData);
      await ensureHasTitleAndError(errorTitle, error);
    });
  });
}

function resetTester(url, type) {
  beforeEach(async () => {
    await createDocForType(type);
  });
  afterEach(async () => {
    await clearTheDb();
  });
  it(
    "valid email",
    async () => {
      await reset(url, data.email);
      const title = `${type} Log In`;
      const info =
        "A link has been sent to your email. Please click the link to reset password.";
      await ensureHasTitleAndInfo(title, info);
    },
    MAX_TESTING_TIME
  );
  it("invalid email", async () => {
    const invalidEmail = "samuelmayna@gmail.com123";
    await reset(url, invalidEmail);
    const title = `${type} Reset Password`;
    const error = "Please enter a valid email.";
    await ensureHasTitleAndError(title, error);
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
    doc = await createDocForType(type);
  });
  afterEach(async () => {
    await clearTheDb();
  });
  it(
    "should change password when token is valid",
    async () => {
      const { token } = await TokenGenerator.createOneForId(doc.id);
      const url = `${base}/auth/${generateUrlName(type)}/new-password/${token}`;
      await enterNewPassword(url, passwords);
      await ensureHasTitleAndInfo(
        `${type} Log In`,
        "Password reset successful."
      );
      const id = doc.id;
      const savedDoc = await fetchDocByIdForType(type, id)

      //ensure that the password is also changed in the database.
      const passwordIsNewPassword = await confirmPassword(
        password,
        savedDoc.password
      );
      expect(passwordIsNewPassword).toBeTruthy();


      //ensure that the token is also deleted from the database after successful password reset.
      expect(await TokenGenerator.findOne({
        requesterId: id
      })).toBeNull();
    },
    MAX_TESTING_TIME
  );
  it("should throw when token is invalid", async () => {
    const error = "Too late for reset. Please try again.";
    const token = generateStringSizeN(64)
    const url = `${base}/auth/${generateUrlName(type)}/new-password/${token}`;
    await page.openUrl(url)
    await ensureHasTitleAndError(`${type} Reset Password`, error);
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
    await ensureHasTitleAndError(`New Password`, error);
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

async function createDocForType(type) {
  switch (type) {
    case "Admin":
      return await createNewAdminWithData(data);
      break;
    case "User":
      return await createNewUserWithData(data);
      break;
    default:
      break;
  }
}

async function fetchDocByIdForType(type, id) {
  switch (type) {
    case 'Admin':
      return await fetchDataFromModelById(Admin, id)
      break;
    case 'User':
      return await fetchDataFromModelById(User, id)
      break;
    default:
      break;
  }
}
function generateUrlName(type) {
  switch (type) {
    case "Admin":
      return "admin";
      break;
    case "User":
      return "user";
      break;
    default:
      break;
  }
}


const fetchDataFromModelById = async (Model, id) => {
  return await Model.findById(id);
};

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
