const { EMAIL, BASE_URL } = require("../../config/env");

exports.signUp = async (
  body,
  type,
  validationErrors,
  Model,
  EmailToken,
  emailSender
) => {
  const { email, name } = body;
  const results = {};
  if (validationErrors) {
    results.error = validationErrors;
    return results;
  }
  const existingEmail = await Model.findByEmail(email);
  if (existingEmail) {
    results.error = "Email already exists.Please try another one.";
    return results;
  }

  const tokenDetails = await EmailToken.createOneForEmail(email);

  const emailToSend = {
    from: EMAIL,
    to: email,
    subject: "Email Confirmation",

    html: `<h3> Email Confirmation</h3><p> ${name} Thanks for joining SM Online Shop. The online shop you can trust.</p>
    <br><p>Please click the link to confirm your email :<a href=${BASE_URL}/auth/${type}/confirm-email/${tokenDetails.token}>
    Confirm Email</a></p>
    <p>Please note you only have 1 day to confirm your email.</p>
    <br> Thank you`,
  };
  await Model.createOne(body);
  await emailSender(emailToSend);
  results.success = true;
  return results;
};

exports.confirmEmail = async function (token, EmailToken, Model) {
  const res = {};

  const tokenDetails = await EmailToken.findTokenDetailsByToken(token);

  if (!tokenDetails) {
    res.error =
      "Too late for confirmation or the token is incorrect. Please try again.";

    return res;
  }
  const doc = await Model.findByEmail(tokenDetails.email);
  doc.markEmailAsConfirmed();
  await tokenDetails.delete();
  res.success = true;
  res.info = "Email confirmation succcessful.";
  return res;
};
