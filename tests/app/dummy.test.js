const webdriver = require("selenium-webdriver");
const {connectToTestDb, disconnectFromDb} = require("./config");
const {
  clearTheDb,
  createNewAdminWithData,
  createNewUserWithData,
} = require("../utils/generalUtils");
const Page = require("./utils/Auth");

const MAX_WAITING_TIME = 20000;

const getNewDriverInstance = () => {
  return new webdriver.Builder().forBrowser("chrome").build();
};

const PORT = 5000;
const base = `http://localhost:${PORT}`;
const homepage = `${base}/`;
describe("E2E tests", () => {
  beforeAll(async () => {
    await connectToTestDb();
  });

  afterAll(async () => {
    await disconnectFromDb();
  });
  describe("should sign up for both users and admins", () => {
    describe("-admin", () => {
      const signUpId = `admin-signup`;
      let page;
      beforeEach(async () => {
        page = new Page(getNewDriverInstance());
      });
      afterEach(async () => {
        await page.close();
        page = undefined;
        await clearTheDb();
      });
      it(
        "valid credentials",
        async () => {
          await signUpWithValidCredentials(page, signUpId, "admin");
        },
        MAX_WAITING_TIME
      );
      it(
        "invalid credentials",
        async () => {
          await singUpWithInvalidCredentials(page, signUpId, "admin");
        },
        MAX_WAITING_TIME
      );
    });

    describe("-user", () => {
      const signUpId = `user-signup`;
      let page;
      beforeEach(async () => {
        page = new Page(getNewDriverInstance());
      });
      afterEach(async () => {
        await page.close();
        page = undefined;
        await clearTheDb();
      });
      it(
        "valid credentials",
        async () => {
          await signUpWithValidCredentials(page, signUpId, "user");
        },
        MAX_WAITING_TIME
      );
      it(
        "invalid credentials",
        async () => {
          await singUpWithInvalidCredentials(page, signUpId, "user");
        },
        MAX_WAITING_TIME
      );
    });
  });

  describe("should Login for both users and admins", () => {
    describe("-admin", () => {
      const signUpId = `login`;
      let page;
      beforeEach(async () => {
        page = new Page(getNewDriverInstance());
      });
      afterEach(async () => {
        await page.close();
        page = undefined;
        await clearTheDb();
      });
      it(
        "valid credentials",
        async () => {
          await logInWithValidCredentials(page, signUpId, "admin");
        },
        MAX_WAITING_TIME
      );
      it(
        "invalid credentials",
        async () => {
          await logInpWithInvalidCredentials(page, signUpId, "admin");
        },
        MAX_WAITING_TIME
      );
    });

    describe("-user", () => {
      const signUpId = `user-signup`;
      let page;
      beforeEach(async () => {
        page = new Page(getNewDriverInstance());
      });
      afterEach(async () => {
        await page.close();
        page = undefined;
        await clearTheDb();
      });
      it(
        "valid credentials",
        async () => {
          await signUpWithValidCredentials(page, signUpId, "user");
        },
        MAX_WAITING_TIME
      );
      it(
        "invalid credentials",
        async () => {
          await singUpWithInvalidCredentials(page, signUpId, "user");
        },
        MAX_WAITING_TIME
      );
    });
  });
  // describe("should login for both user and admin", () => {
  //   it(
  //     "admin",
  //     async () => {
  //       admin = await createNewAdminWithData(data);
  //       const adminLoginUrl = `${base}/auth/admin/log-in`;
  //       await login(adminLoginUrl, "admin");
  //     },
  //     MAX_WAITING_TIME
  //   );
  //   it(
  //     "user",
  //     async () => {
  //       await createNewUserWithData(data);
  //       const userLoginUrl = `${base}/auth/user/log-in`;
  //       await login(userLoginUrl, "user");
  //     },
  //     MAX_WAITING_TIME
  //   );
  // });
  // describe("should reset for both user and admin", () => {
  //   it(
  //     "admin",
  //     async () => {
  //       await createNewAdminWithData(data);
  //       const userLoginUrl = `${base}/auth/admin/log-in`;
  //       await reset(userLoginUrl, "admin");
  //     },
  //     MAX_WAITING_TIME
  //   );
  //   it(
  //     "user",
  //     async () => {
  //       await createNewUserWithData(data);
  //       const userLoginUrl = `${base}/auth/user/log-in`;
  //       await reset(userLoginUrl, "user");
  //     },
  //     MAX_WAITING_TIME
  //   );
  // });
  // it("should log out", async () => {
  //   await createNewUserWithData(data);
  //   const userLoginUrl = `${base}/auth/user/log-in`;
  //   await logout(userLoginUrl);
  // });
});

const signUpWithValidCredentials = async (page, signUpId, type) => {
  const data = {
    name: "Samuel Maina",
    password: "Smaina7888>???",
    email: "samuelmayna@gmail.com",
  };
  const {title, info} = await signUp(page, signUpId, data, ["info"]);
  if (type === "admin") {
    expect(title).toEqual("Admin Log In");
  }
  if (type === "user") {
    expect(title).toEqual("User Log In");
  }
  expect(info).toEqual(`Dear ${data.name}, You have successfully signed up`);
};

const singUpWithInvalidCredentials = async (page, signUpId, type) => {
  const invalidNameData = {
    name: "sam",
    email: "samuelmayna@gmail.com",
    password: "Smaina7888>???",
  };
  const response = await signUp(page, signUpId, invalidNameData, ["error"]);
  expect(response.error).toEqual(
    "Name too short or it contains symbols.Enter only alphanumerics."
  );
  const title = response.title;
  if (type === "admin") {
    expect(title).toEqual("Admin Sign Up");
  }
  if (type === "user") {
    expect(title).toEqual("User Sign Up");
  }
};
const login = async (page, loginId, data, expectations = []) => {
  try {
    let error;
    await page.openUrl(homepage);
    await page.hold(500);
    await page.clickById(loginId);
    await page.hold(500);
    await page.enterEmail(data.email);
    await page.enterPassword(data.password);
    await page.submit("login");
    await page.hold(500);
    for (const expectation of expectations) {
      if (expectation === "error") {
        error = await page.getError();
        continue;
      }
    }
    const title = await page.getTitle();
    return {
      title,
      error,
    };
  } catch (error) {
    throw new Error(error);
  }
};
const signUp = async (page, signUpId, data, expectations = []) => {
  try {
    let error, info;
    await page.openUrl(homepage);
    await page.hold(500);
    await page.clickById(signUpId);
    await page.hold(500);
    await page.enterName(data.name);
    await page.enterEmail(data.email);
    await page.enterPassword(data.password);
    await page.enterConfirmPassword(data.password);
    await page.submit("signup");
    await page.hold(500);

    //if we try to get an element that is not there the driver throws an error instead of
    // returning null.Also it is propagating errors so we can not return null in catch blocks.
    //so we retrieve messages according to what we expect.
    for (const expectation of expectations) {
      if (expectation === "error") {
        error = await page.getError();
        continue;
      }
      if (expectation === "info") {
        info = await page.getInfo();
        continue;
      }
    }
    const title = await page.getTitle();
    return {
      info,
      title,
      error,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const reset = async (loginUrl, type) => {
  try {
    const driver = getNewDriverInstance();
    await driver.get(loginUrl);
    await driver.findElement(webdriver.By.id("reset")).click();
    await driver.sleep(500);
    await driver.findElement(webdriver.By.name("email")).sendKeys(data.email);
    await driver.findElement(webdriver.By.id("reset")).click();
    await driver.findElement(webdriver.By.id("login")).click();
    const title = await driver.getTitle();
    const infoMessage = await driver
      .findElement(webdriver.By.className("info"))
      .getText();
    await driver.quit();
    if (type === "admin") expect(title).toEqual("Admin Log In");
    else expect(title).toEqual("User Log In");
    expect(infoMessage).toEqual(
      "A link has been sent into your email.Click on it to reset password"
    );
  } catch (error) {
    throw new Error(error);
  }
};

const logout = async loginUrl => {
  const driver = getNewDriverInstance();
  await driver.get(loginUrl);
  await driver.findElement(webdriver.By.name("email")).sendKeys(data.email);

  await driver.sleep(500);
  await driver.findElement(webdriver.By.id("logout")).click();
  const title = await driver.getTitle();
  expect(title).toEqual("Shop");
};
