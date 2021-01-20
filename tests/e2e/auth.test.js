const {TokenGenerator, User, Admin} = require("../../database/models");

const {startApp, closeApp, getNewDriverInstance} = require("./config");

const ranges = require("../../config/constraints").base;
const {generateStringSizeN} = require("../utils/generalUtils");
const {verifyEqual, verifyTruthy} = require("../utils/testsUtils");

const {
  clearTheDb,
  createNewAdminWithData,
  createNewUserWithData,
  confirmPassword,
} = require("../utils/generalUtils");
const {Auth, session} = require("./utils");

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
  describe("should sign up for both users and admins", () => {
    let url = `${baseAuth}/admin/sign-up`;
    signUpTester("Admin", url);
    url = `${baseAuth}/user/sign-up`;
    signUpTester("User", url);
  });
  describe("should Login for both users and admins", () => {
    let logInUrl = `${baseAuth}/admin/log-in`;
    //this is the title of the redirected page after successful login.
    let redirectPageTitle = "Your Products";
    loginTester("Admin", logInUrl, redirectPageTitle);
    logInUrl = `${baseAuth}/user/log-in`;
    redirectPageTitle = "Products";
    loginTester("User", logInUrl, redirectPageTitle);

    // describe("-user", () => {
    //   const logInUrl = `${baseAuth}/user/log-in`;
    //   beforeEach(async () => {
    //     await createNewUserWithData(data);
    //   });
    //   afterEach(async () => {
    //     await clearTheDb();
    //   });
    //   it("Correct credentials", async () => {
    //     await login(logInUrl, data);
    //     const title = await page.getTitle();
    //     expect(title).toEqual("Products");
    //   });
    //   it("inCorrect credentials", async () => {
    //     const {email} = data;
    //     const invalidData = {
    //       email,
    //       password: "Someword2233?",
    //     };
    //     await login(logInUrl, invalidData);
    //     const title = "User Log In";
    //     await ensureHasTitleAndError(title, error);
    //   });
    // });
  });
  // describe("Can click reset and submit reset email", () => {
  //   const newPassword = "Smainachez5885:?";
  //   const passwords = {
  //     password: newPassword,
  //     confirmPassword: newPassword,
  //   };
  //   describe("admin", () => {
  //     const resetUrl = `${baseAuth}/admin/reset`;
  //     let admin;
  //     beforeEach(async () => {
  //       admin = await createNewAdminWithData(data);
  //     });
  //     afterEach(async () => {
  //       await clearTheDb();
  //     });
  //     it("valid email", async () => {
  //       const adminId = admin.id;
  //       await reset(resetUrl, data.email);
  //       const title = "Admin Log In";
  //       const info =
  //         "A link has been sent to your email. Please click the link to reset password.";
  //       await ensureHasTitleAndInfo(title, info);
  //       const tokenDetails = await TokenGenerator.findOne({
  //         requesterID: adminId,
  //       });
  //       await enterNewPassword(tokenDetails.token, "admin", passwords);
  //       await ensureHasTitleAndInfo(
  //         "Admin Log In",
  //         "Password reset successful"
  //       );
  //       // ensure that the password is  also changed in the database.
  //       const {password} = await fetchDataFromModelById(Admin, adminId);
  //       const passwordIsNewPassword = await confirmPassword(
  //         passwords.password,
  //         password
  //       );
  //       expect(passwordIsNewPassword).toBeTruthy();
  //       const tokenDetaislAfterSuccessfulReset = await TokenGenerator.findOne({
  //         requesterID: adminId,
  //       });
  //       expect(tokenDetaislAfterSuccessfulReset).toBeNull();
  //     });
  //     it("invalid email", async () => {
  //       const invalidEmail = "samuelmayna@gmail.com123";
  //       await reset(resetUrl, invalidEmail);
  //       const title = "Admin Reset Password";
  //       const error = "Please enter a valid email.";
  //       await ensureHasTitleAndError(title, error);
  //     });
  //   });
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
  //         requesterID: userId,
  //       });
  //       await page.hold(200);
  //       await enterNewPassword(tokenDetails.token, "user", passwords);
  //       await ensureHasTitleAndInfo("User Log In", "Password reset successful");
  //       // ensure that the password is  also changed in the database.
  //       const {password} = await fetchDataFromModelById(User, userId);
  //       const passwordIsNewPassword = await confirmPassword(
  //         passwords.password,
  //         password
  //       );
  //       expect(passwordIsNewPassword).toBeTruthy();
  //       const tokenDetaislAfterSuccessfulReset = await TokenGenerator.findOne({
  //         requesterID: userId,
  //       });
  //       expect(tokenDetaislAfterSuccessfulReset).toBeNull();
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
async function signUpTester(type, url) {
  const expectedInfo = `Dear ${data.name}, You have successfully signed up`;

  describe(`${type}`, () => {
    beforeEach(async () => {
      await page.openUrl(url);
    }, MAX_SETUP_TIME);
    afterEach(async () => {
      await clearTheDb();
    });
    it("valid credentials", async () => {
      await signUp(url, data);
      const expectedTitle = `${type} Log In`;
      await ensureHasTitleAndInfo(expectedTitle, expectedInfo);
    });
    it("Invalid credentials", async () => {
      const {email, password} = data;

      const {minlength, error} = ranges.name;
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
      const expectedErrorMessage =
        "Email already exists.Please try another one.";
      const expectedTitle = `${type} Sign Up`;
      await ensureHasTitleAndError(expectedTitle, expectedErrorMessage);
    });
  });
}
async function loginTester(type, url, redirectTitle) {
  const error = "Invalid Email or Password";
  const errorTitle = `${type} Log In`;
  const {password, email} = data;

  describe(`${type}`, () => {
    beforeEach(async () => {
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
  });
}
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
const enterNewPassword = async (token, type, passwords) => {
  //this is the url that is sent via email wheere the user
  //will click so as to set a new password.
  const newPasswordUrl = `${base}/auth/${type}/new-password/${token}`;
  await page.openUrl(newPasswordUrl);
  await page.enterDataByName("password", passwords.password);
  await page.enterDataByName("confirmPassword", passwords.confirmPassword);
  await page.clickById("change-password");
};

const fetchDataFromModelById = async (Model, id) => {
  return await Model.findById(id);
};
