const { EMAIL, BASE_URL } = require("../../../src/config/env");
const { baseAuth } = require("../../../src/useCases");
const {
  verifyTruthy,
  ensureCloselyEqual,
  verifyEqual,
  verifyFalsy,
  verifyUndefined,
} = require("../../utils/testsUtils");

describe("Auth use cases", () => {
  describe("signUp", () => {
    const signUp = baseAuth.signUp;
    const body = {
      name: "John Doe",
      email: "johndoe@email.com",
    };

    it("should create one when the there are no validation Errors and email does not exist in the database.", async () => {
      let emailFinderCalled;
      let emailCreateFor;
      let docCreated;
      let isEmailSent;

      const Model = {
        findByEmail: function (email) {
          emailFinderCalled = true;
          return false;
        },
        createOne: function (body) {
          docCreated = body;
        },
      };

      const token = "sometoken";
      const EmailToken = {
        createOneForEmail: function (email) {
          emailCreateFor = email;
          return {
            token: token,
          };
        },
      };

      const emailSender = (email) => {
        isEmailSent = true;
      };

      const type = "user";
      const validationError = undefined;

      const results = await signUp(
        body,
        type,
        validationError,
        Model,
        EmailToken,
        emailSender
      );

      verifyTruthy(results.success);
      const { name, email } = body;

      //ensure that the findByEmail is called.
      verifyTruthy(emailFinderCalled);

      //ensure that the createOne function is called.
      verifyEqual(docCreated, body);

      //ensure the createOneForEmailFunction is called.
      verifyEqual(emailCreateFor, email);

      //ensure that the sent email is the same as the
      verifyTruthy(isEmailSent);
    });

    it("should return an error if there are validation errors", async () => {
      let emailFinderCalled;
      let emailCreateFor;
      let docCreated;
      let isEmailSent;

      const Model = {
        findByEmail: function (email) {
          emailFinderCalled = true;
          return false;
        },
        createOne: function (body) {
          docCreated = body;
        },
      };

      const token = "sometoken";
      const EmailToken = {
        createOneForEmail: function (email) {
          emailCreateFor = email;
          return {
            token: token,
          };
        },
      };

      const emailSender = (email) => {
        isEmailSent = true;
      };

      const type = "user";

      const validationError = "some error";

      const results = await signUp(
        body,
        type,
        validationError,
        Model,
        EmailToken,
        emailSender
      );

      verifyEqual(results.error, validationError);
      const { name, email } = body;

      //ensure that the findByEmail is not Called.
      verifyFalsy(emailFinderCalled);

      //ensure that the doc is not created;
      verifyUndefined(docCreated);

      //ensure the createOneForEmailFunction is not  called.
      verifyUndefined(emailCreateFor);

      //ensure that the email is not sent
      verifyUndefined(isEmailSent);
    });

    it("should return an error if the email already exists", async () => {
      let emailFinderCalled;
      let emailCreateFor;
      let docCreated;
      let isEmailSent;

      const Model = {
        findByEmail: function (email) {
          emailFinderCalled = true;
          return true;
        },
        createOne: function (body) {
          docCreated = body;
        },
      };

      const token = "sometoken";
      const EmailToken = {
        createOneForEmail: function (email) {
          emailCreateFor = email;
          return {
            token: token,
          };
        },
      };

      const emailSender = (email) => {
        isEmailSent = true;
      };

      const type = "user";

      const validationError = undefined;
      const error = "Email already exists.Please try another one.";

      const results = await signUp(
        body,
        type,
        validationError,
        Model,
        EmailToken,
        emailSender
      );

      verifyEqual(results.error, error);
      const { name, email } = body;

      //ensure that the findByEmail is Called.
      verifyTruthy(emailFinderCalled);

      //ensure that the doc is not created;
      verifyUndefined(docCreated);

      //ensure the createOneForEmailFunction is not  called.
      verifyUndefined(emailCreateFor);

      //ensure that the email is not sent
      verifyUndefined(isEmailSent);
    });
  });

  describe("Confirm Email", () => {
    it("should confirm email if the token is correct", async () => {
      let calledToken;
      let foundEmail;
      let isTokenDeleted;
      let emailIsMarkedAsConfirmed;

      const testEmail = "example@email.com";

      const EmailToken = {
        findTokenDetailsByToken: function (token) {
          calledToken = token;
          const tokenDetails = {
            email: testEmail,
            delete: function () {
              isTokenDeleted = true;
            },
          };
          return tokenDetails;
        },
      };
      const Model = {
        findByEmail: function (email) {
          foundEmail = email;
          const doc = {
            markEmailAsConfirmed: function () {
              emailIsMarkedAsConfirmed = true;
            },
          };
          return doc;
        },
      };
      const token = "some token";

      const info = "Email confirmation succcessful.";

      const res = await baseAuth.confirmEmail(token, EmailToken, Model);
      //ensure that the findDetailByToken is called.
      verifyEqual(calledToken, token);

      //ensure findByEmail is called
      verifyEqual(foundEmail, testEmail);

      //ensure is marked as read
      verifyTruthy(emailIsMarkedAsConfirmed);

      //ensure that the token is deleted
      verifyTruthy(isTokenDeleted);

      //ensure that the system gives success response.
      verifyTruthy(res.success);

      //ensure that the success info is appended to the res.
      verifyEqual(res.info, info);
    });

    it("should not confirm email if the token is incorrect", async () => {
      let calledToken;
      let foundEmail;
      let isTokenDeleted;
      let emailIsMarkedAsConfirmed;

      const testEmail = "example@email.com";

      const EmailToken = {
        findTokenDetailsByToken: function (token) {
          calledToken = token;
          const tokenDetails = {
            email: testEmail,
            delete: function () {
              isTokenDeleted = true;
            },
          };
          return null;
        },
      };
      const Model = {
        findByEmail: function (email) {
          foundEmail = email;
          const doc = {
            markEmailAsConfirmed: function () {
              emailIsMarkedAsConfirmed = true;
            },
          };
          return doc;
        },
      };
      const token = "some token";
      const error =
        "Too late for confirmation or the token is incorrect. Please try again.";

      const res = await baseAuth.confirmEmail(token, EmailToken, Model);
      //ensure that the findDetailByToken is called.
      verifyEqual(calledToken, token);

      //ensure findByEmail is not called
      verifyUndefined(foundEmail);

      //ensure that the email is not marked as verified
      verifyUndefined(emailIsMarkedAsConfirmed);

      verifyEqual(res.error, error);
    });
  });
});
