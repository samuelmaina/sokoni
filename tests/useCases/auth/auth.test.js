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
      // var expectedEmail = {
      //   from: EMAIL,
      //   to: email,
      //   subject: "Email Confirmation",

      //   html: `<h3> Email Confirmation</h3><p> ${name} Thanks for joining SM Online Shop. The online shop you can trust.</p>
      //   <br><p>Please click the link to confirm your email :<a href=${BASE_URL}/auth/${type}/confirm-email/${token}>
      //   Confirm Email</a></p>
      //   <p>Please note you only have one hour to confirm your email.</p>
      //   <br> Thank you`,
      // };
      // verifyEqual(expectedEmail, sentEmail);

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
      // var expectedEmail = {
      //   from: EMAIL,
      //   to: email,
      //   subject: "Email Confirmation",

      //   html: `<h3> Email Confirmation</h3><p> ${name} Thanks for joining SM Online Shop. The online shop you can trust.</p>
      //   <br><p>Please click the link to confirm your email :<a href=${BASE_URL}/auth/${type}/confirm-email/${token}>
      //   Confirm Email</a></p>
      //   <p>Please note you only have one hour to confirm your email.</p>
      //   <br> Thank you`,
      // };
      // verifyEqual(expectedEmail, sentEmail);

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
      // var expectedEmail = {
      //   from: EMAIL,
      //   to: email,
      //   subject: "Email Confirmation",

      //   html: `<h3> Email Confirmation</h3><p> ${name} Thanks for joining SM Online Shop. The online shop you can trust.</p>
      //   <br><p>Please click the link to confirm your email :<a href=${BASE_URL}/auth/${type}/confirm-email/${token}>
      //   Confirm Email</a></p>
      //   <p>Please note you only have one hour to confirm your email.</p>
      //   <br> Thank you`,
      // };
      // verifyEqual(expectedEmail, sentEmail);

      //ensure that the findByEmail is not Called.
      verifyTruthy(emailFinderCalled);

      //ensure that the doc is not created;
      verifyUndefined(docCreated);

      //ensure the createOneForEmailFunction is not  called.
      verifyUndefined(emailCreateFor);

      //ensure that the email is not sent
      verifyUndefined(isEmailSent);
    });
  });
});
