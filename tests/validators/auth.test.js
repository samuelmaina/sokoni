const requires = require("../utils/requires");

const {
  validateStringField,
  ensureGeneratesErrorOnPart,
  ensureDoesNotGeneratesErrorOnPart,
} = require("./utils");

const ranges = requires.constrains.base;
const { auth } = requires.validators;

const { generateStringSizeN } = require("../utils/generalUtils/utils");
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

describe("Auth validators", () => {
  describe("Name", () => {
    const { minlength, maxlength, error } = ranges.name;
    validateStringField(nameV, "name", minlength, maxlength, error);
  });
  describe("email", () => {
    const { minlength, maxlength, error } = ranges.email;

    it(" throws for small emails", async () => {
      const body = {
        email: generateStringSizeN(minlength - 1),
      };
      await ensureGeneratesErrorOnPart(body, emailV, error);
    });
    it("throws for large  emails", async () => {
      const body = {
        email: generateStringSizeN(maxlength + 1),
      };
      await ensureGeneratesErrorOnPart(body, emailV, error);
    });

    it("throws on ill formatted email", async () => {
      const body = {
        email: "illformatted@email.com123",
      };
      await ensureGeneratesErrorOnPart(
        body,
        emailV,
        "Please enter a valid email."
      );
    });
    describe("Does not generate on valid emails", () => {
      it("email of min length", async () => {
        const body = {
          email: "e@ma.com",
        };
        await ensureDoesNotGeneratesErrorOnPart(body, emailV);
      });
      it("email of max length", async () => {
        const body = {
          email: "five1five2five3@five4.com",
        };
        await ensureDoesNotGeneratesErrorOnPart(body, emailV);
      });
    });
  });
  describe("password", () => {
    const { minlength, maxlength, error } = ranges.password;
    it("should throw for short passwords", async () => {
      const body = {
        password: generateStringSizeN(minlength - 1),
      };
      await ensureGeneratesErrorOnPart(body, passwordV, error);
    });
    it("should throw for long passwords", async () => {
      const body = {
        password: generateStringSizeN(maxlength + 1),
      };
      await ensureGeneratesErrorOnPart(body, passwordV, error);
    });
    describe("constrains on right length passwords", () => {
      it("Contains no number", async () => {
        const errorMessage = "Password must contain a number.";
        const password = "Password@???";
        const body = {
          password,
        };
        await ensureGeneratesErrorOnPart(body, passwordV, errorMessage);
      });
      it("Contains no lowercase", async () => {
        const errorMessage = "Password must contain a lowercase character.";

        const password = "PASSWORD12??";
        const body = {
          password,
        };
        await ensureGeneratesErrorOnPart(body, passwordV, errorMessage);
      });
      it("Contains no Uppercase", async () => {
        const errorMessage = "Password must contain an uppercase character.";

        const password = "password12??";
        const body = {
          password,
        };
        await ensureGeneratesErrorOnPart(body, passwordV, errorMessage);
      });
      it("Contains no special character", async () => {
        const errorMessage = "Password must contain a special character.";

        const password = "Password1234";
        const body = {
          password,
        };
        await ensureGeneratesErrorOnPart(body, passwordV, errorMessage);
      });
    });
    describe("Does not generate on valid length password", () => {
      it("min length", async () => {
        const body = {
          password: "Pas55ov?",
        };
        await ensureDoesNotGeneratesErrorOnPart(body, passwordV);
      });
      it("max length", async () => {
        const body = {
          password: "Five1Five2Five?",
        };
        await ensureDoesNotGeneratesErrorOnPart(body, passwordV);
      });
    });
  });
  describe("confirm password", () => {
    it(" throw when confirm password not the same as password", async () => {
      const errorMessage = "Password and confirm password do not match!";
      const password = "password1234?";
      const confirmPassword = "Password1234?";
      const body = {
        password,
        confirmPassword,
      };
      await ensureGeneratesErrorOnPart(body, confirmPasswordV, errorMessage);
    });
    it("does not throw when they are the same", async () => {
      const password = "Password1234?";
      const confirmPassword = "Password1234?";
      const body = {
        password,
        confirmPassword,
      };
      await ensureDoesNotGeneratesErrorOnPart(body, confirmPasswordV);
    });
  });
  describe("All the combined validators have have all the required validators", () => {
    it("sign up validator has name, email , password and confirm password validators.", () => {
      const validators = [nameV, emailV, passwordV, confirmPasswordV];
      //ensure no other validators are appended.
      expect(signUpValidator.length).toEqual(4);
      //and that the only contained validators are the required 4.
      for (const validator of validators) {
        expect(signUpValidator).toContain(validator);
      }
    });
    it("login validator has both emailV and passwordV", async () => {
      const validators = [emailV, passwordV];
      expect(loginValidator.length).toEqual(2);

      for (const validator of validators) {
        expect(loginValidator).toContain(validator);
      }
    });
    it("reset validator has emailV", async () => {
      expect(resetValidator.length).toEqual(1);
      expect(resetValidator).toContain(emailV);
    });
    it("new Password validator has both password and confirmPassword validators.", async () => {
      const validators = [passwordV, confirmPasswordV];
      expect(newPasswordValidator.length).toEqual(2);
      for (const validator of validators) {
        expect(newPasswordValidator).toContain(validator);
      }
    });
  });
});
