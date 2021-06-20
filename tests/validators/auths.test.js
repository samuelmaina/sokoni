const {generateStringSizeN} = require("../utils/generalUtils");

const {
  validateStringField,
  ensureGeneratesErrorOnBody,
  ensureDoesNotGenerateErrorOnBody,
  validateMiddlewares,
} = require("./utils");

const ranges = require("../../config/constraints").base;
const {auth} = require("../../validators");
const {
  nameV,
  emailV,
  passwordV,
  confirmPasswordV,
  signUpValidator,
  loginValidator,
  resetValidator,
  newPasswordValidator,
} = auth;

describe.skip("Auth validators", () => {
  describe("name", () => {
    const {minlength, maxlength, error} = ranges.name;
    validateStringField()
      .onField("name")
      .usingValidator(nameV)
      .withLowerLimitLength(minlength)
      .withUpperLimitLength(maxlength)
      .withFielNameOnErrrorAs("Name")
      .withErrorMessage(error)
      .runTests();
  });
  describe("email", () => {
    const lowerLimit = ranges.email[0];
    const upperLimit = ranges.email[1];
    it("ill formatted emails", async () => {
      const errorMessage = "Please enter a valid email.";
      const inValid= "someexample.com";
        await ensureGeneratesErrorOnBody(
          {
            email,
          },
          emailV,
          errorMessage
        );
      



        
    });
    validateStringField("email", email, lowerLimit, upperLimit, "Email");
  });
  describe("password", () => {
    const lowerLimit = ranges.password[0];
    const upperLimit = ranges.password[1];

    it("Contains no number", async () => {
      const errorMessage = "Password must contain a number.";

      const password = "Password@???";
      const body = {
        password,
      };
      await ensureGeneratesErrorOnBody(body, passwordV, errorMessage);
    });
    it("Contains no lowercase", async () => {
      const errorMessage = "Password must contain a lowercase character.";

      const password = "PASSWORD12??";
      const body = {
        password,
      };
      await ensureGeneratesErrorOnBody(body, passwordV, errorMessage);
    });
    it("Contains no Uppercase", async () => {
      const errorMessage = "Password must contain an uppercase character.";

      const password = "password12??";
      const body = {
        password,
      };
      await ensureGeneratesErrorOnBody(body, passwordV, errorMessage);
    });
    it("Contains no special character", async () => {
      const errorMessage = "Password must contain a special character.";

      const password = "Password1234";
      const body = {
        password,
      };
      await ensureGeneratesErrorOnBody(body, passwordV, errorMessage);
    });
  });
  describe("confirm password", () => {
    it("confirm password not the same as password", async () => {
      const errorMessage = "Password and confirm password do not match!";
      const password = "password1234?";
      const confirmPassword = "Password1234?";
      const body = {
        password,
        confirmPassword,
      };
      await ensureGeneratesErrorOnBody(body, confirmPasswordV, errorMessage);
    });
    it("does not throw when they are the same", async () => {
      const password = "Password1234?";
      const confirmPassword = "Password1234?";
      const body = {
        password,
        confirmPassword,
      };
      await ensureDoesNotGenerateErrorOnBody(body, confirmPasswordV);
    });
  });
  describe("All the combined validators have have all the required validators", () => {
    const name = generateStringSizeN(ranges.name.minlength);
    const email = "johndoe@email.com";
    const password = "Password54>";
    const confirmPassword = password;

    const invalidName = {
      name: generateStringSizeN(ranges.name.maxlength + 1),
      email,
      password,
      confirmPassword,
    };
    const invalidEmail = {
      name,
      email: "johndoe@email.com1234",
      password,
      confirmPassword,
    };
    const invalidPassword = {
      name,
      email,
      password: generateStringSizeN(ranges.password.maxlength + 1),
      confirmPassword,
    };
    const invalidConfirmPassword = {
      name,
      email,
      password,
      confirmPassword: password + "k",
    };
    it("sign up validator has name, email , password and confirm password validators.", async () => {
      for (const invalid of [
        invalidName,
        invalidEmail,
        invalidPassword,
        invalidConfirmPassword,
      ]) {
        await validateMiddlewares(invalid, signUpValidator);
      }
    });
    it("login validator has both emailV and passwordV", async () => {
      for (const invalid of [invalidEmail, invalidPassword]) {
        await validateMiddlewares(invalid, loginValidator);
      }
    });
    it("reset validator has emailV", async () => {
      for (const invalid of [invalidEmail]) {
        await validateMiddlewares(invalid, resetValidator);
      }
    });
    it("new Password validator has both password and confirmPassword validators.", async () => {
      for (const invalid of [invalidPassword, invalidConfirmPassword]) {
        await validateMiddlewares(invalid, newPasswordValidator);
      }
    });
  });
});
