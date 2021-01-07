//Boundary analysis is used to
//get the test data for this
//test suite.
const {equal} = require("assert");

const {
  ensureGeneratesErrorOnBody,
  ensureDoesNotGenerateErrorOnBody,
} = require("./utils");

const {BaseServices} = require("../../../database/services");
const {ranges, errorMessages} = BaseServices;
const {validators, validationResults} = require("../../../utils");
const {auth} = validators;
const {
  nameValidator,
  emailValidator,
  passwordValidator,
  confirmPasswordValidator,
} = auth;

const generateNames = () => {
  let lowerBoundary = ranges.name[0];
  let upperBoundary = ranges.name[1];

  const name1 = "JohnD";
  //asser that the test data has the
  //desired length.
  equal(name1.length, lowerBoundary);

  const name2 = "johnDo";
  equal(name2.length, lowerBoundary + 1);

  const name3 = "john doe long name .";
  equal(name3.length, upperBoundary);

  const name4 = "john doe long name ";
  equal(name4.length, upperBoundary - 1);
  return [name1, name2, name3, name4];
};
const generateEmails = () => {
  lowerBoundary = ranges.email[0];
  upperBoundary = ranges.email[1];

  const email1 = "joe@e.co";
  equal(email1.length, lowerBoundary);

  const email2 = "joe@e.com";
  equal(email2.length, lowerBoundary + 1);

  const email3 = "joedoeverylong@678901.com";
  equal(email3.length, upperBoundary);

  const email4 = "joedoeverylong@67890.com";
  equal(email4.length, upperBoundary - 1);
  return [email1, email2, email3, email4];
};
const generatePasswords = () => {
  lowerBoundary = ranges.password[0];
  upperBoundary = ranges.password[1];

  const password1 = "Pass@67?";
  equal(password1.length, lowerBoundary);

  const password2 = "Passw@67?";
  equal(password2.length, lowerBoundary + 1);

  const password3 = "Password?12345@";
  equal(password3.length, upperBoundary);

  const password4 = "Password?1234#";
  equal(password4.length, upperBoundary - 1);
  return [password1, password2, password3, password4];
};

const generateValidBoundaryData = () => {
  return {
    name: generateNames(),
    email: generateEmails(),
    password: generatePasswords(),
  };
};

const validBoundaryData = generateValidBoundaryData();
describe("Auth validators throws on invalid data", () => {
  describe("name", () => {
    let lowerLimit = ranges.name[0];
    let upperLimit = ranges.name[1];

    it(`Non string Name `, async () => {
      const errorMessages = "Name must be a string.";
      //represents the other non-strings
      //i.e arrays, objects etc.
      //no need to test them.
      const name = 1234;
      const body = {
        name,
      };
      await ensureGeneratesErrorOnBody(body, nameValidator, errorMessages);
    });
    describe(`< ${lowerLimit} and > ${upperLimit}`, () => {
      it(`< ${lowerLimit} characters long`, async () => {
        const name = "john";
        equal(name.length, lowerLimit - 1);
        const body = {
          name,
        };
        await ensureGeneratesErrorOnBody(
          body,
          nameValidator,
          errorMessages.name
        );
      });
      it(`> ${upperLimit} characters long`, async () => {
        const name = "John Doe so Long Name";
        equal(name.length, upperLimit + 1);
        const body = {
          name,
        };
        await ensureGeneratesErrorOnBody(
          body,
          nameValidator,
          errorMessages.name
        );
      });
    });

    it("does not throw on valid boundary name", async () => {
      for (const valid of validBoundaryData.name) {
        const body = {
          name: valid,
        };
        await ensureDoesNotGenerateErrorOnBody(body, nameValidator);
      }
    });
  });
  describe("email", () => {
    const lowerLimit = ranges.email[0];
    const upperLimit = ranges.email[1];

    it(`Non string `, async () => {
      const errorMessage = "Email must be a string.";
      const email = 1234;
      const body = {
        email,
      };
      await ensureGeneratesErrorOnBody(body, emailValidator, errorMessage);
    });

    describe(`< ${lowerLimit} and > ${upperLimit}`, () => {
      it(`< ${lowerLimit} characters long`, async () => {
        const email = "jo@o.co";
        equal(email.length, lowerLimit - 1);
        const body = {
          email,
        };
        await ensureGeneratesErrorOnBody(
          body,
          emailValidator,
          errorMessages.email
        );
      });
      it(`> ${upperLimit} characters long`, async () => {
        const email = "johndoe@kegmail6789101.com";
        equal(email.length, upperLimit + 1);
        const body = {
          email,
        };
        await ensureGeneratesErrorOnBody(
          body,
          emailValidator,
          errorMessages.email
        );
      });
    });

    it("ill formatted emails", async () => {
      const errorMessage = "Please enter a valid email.";

      const lackingAt = "someexample.com";
      const lackingDot = "some@example";
      const havingNumberAfterDomainType = "some@example.com1";

      const invalids = [lackingAt, lackingDot, havingNumberAfterDomainType];
      for (const email of invalids) {
        await ensureGeneratesErrorOnBody(
          {
            email,
          },
          emailValidator,
          errorMessage
        );
      }
    });

    it("does not throw valid boundary emails", async () => {
      for (const valid of validBoundaryData.email) {
        const body = {
          email: valid,
        };
        await ensureDoesNotGenerateErrorOnBody(
          body,
          emailValidator,
          errorMessages.email
        );
      }
    });
  });
  describe("password", () => {
    const lowerLimit = ranges.password[0];
    const upperLimit = ranges.password[1];

    it("non -string", async () => {
      const errorMessage = "Password must be a string.";

      const password = [1, 2];
      const body = {
        password,
      };
      await ensureGeneratesErrorOnBody(body, passwordValidator, errorMessage);
    });
    describe(`< ${lowerLimit} and > ${upperLimit}`, () => {
      it(`${ranges.password[0] - 1} characters long`, async () => {
        const shortPassword = "joh@12?";
        equal(shortPassword.length, lowerLimitMinus1);
        const body = {
          password: shortPassword,
        };
        const req = mockReq(body);
        const res = mockRes();
        await applyValidation(req, res, passwordValidator);
        const validationErrors = validationResults(req);
        expect(validationErrors).toBe(errorMessages.password);
      });
      it(`${ranges.password[1] + 1} characters long`, async () => {
        const longPassword = "Password@?123456";
        equal(longPassword.length, upperLimitPlus1);
        const body = {
          password: longPassword,
        };
        const req = mockReq(body);
        const res = mockRes();
        await applyValidation(req, res, passwordValidator);
        const validationErrors = validationResults(req);
        expect(validationErrors).toBe(errorMessages.password);
      });
    });

    it("Contains no number", async () => {
      const password = "Password@???";
      const body = {
        password: password,
      };
      const req = mockReq(body);
      const res = mockRes();
      await applyValidation(req, res, passwordValidator);
      const validationErrors = validationResults(req);
      expect(validationErrors).toBe("Password must contain a number.");
    });
    it("Contains no lowercase", async () => {
      const password = "PASSWORD12??";
      const body = {
        password: password,
      };
      const req = mockReq(body);
      const res = mockRes();
      await applyValidation(req, res, passwordValidator);
      const validationErrors = validationResults(req);
      expect(validationErrors).toBe(
        "Password must contain a lowercase character."
      );
    });
    it("Contains no Uppercase", async () => {
      const password = "password12??";
      const body = {
        password: password,
      };
      const req = mockReq(body);
      const res = mockRes();
      await applyValidation(req, res, passwordValidator);
      const validationErrors = validationResults(req);
      expect(validationErrors).toBe(
        "Password must contain an uppercase character."
      );
    });
    it("Contains no special character", async () => {
      const password = "Password1234";
      const body = {
        password: password,
      };
      const req = mockReq(body);
      const res = mockRes();
      await applyValidation(req, res, passwordValidator);
      const validationErrors = validationResults(req);
      expect(validationErrors).toBe(
        "Password must contain a special character."
      );
    });
    it("does not throw valid boundary passwords", async () => {
      for (const valid of validBoundaryData.password) {
        const body = {
          password: valid,
        };
        const req = mockReq(body);
        const res = mockRes();
        await applyValidation(req, res, passwordValidator);
        const validationErrors = validationResults(req);
        expect(validationErrors).toBeUndefined();
      }
    });
  });
  it.skip("confirm password not the same as password", async () => {
    const password = "password1234?";
    const confirmPassword = "Password1234?";
    const req = mockReq({
      password,
      confirmPassword,
    });
    const res = mockRes();
    await applyValidation(req, res, confirmPasswordValidator);
    const error = validationResults(req);
    expect(error).toBe("Password and confirm password do not match!");
  });
});
