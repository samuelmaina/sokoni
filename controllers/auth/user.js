require("dotenv").config();

const TokenGenerator = require("../../database/models/tokenGenerator");
const { User } = require("../../database/interfaces/auth");

const errorHandler = require("../../util/errorHandler");
const validationErrorsIn = require("../../util/validationResults");

const transporter = require("../../util/emailSender");

const routingPath = "/user/auth/";

const renderPage = require("../../util/renderFunction");

exports.getSignUp = (req, res, next) => {
  renderPage(req, res, "auth/signup", "User Sign Up", "signup", "signup");
};

exports.postSignUp = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const previousData = {
      email,
      name,
      password
    };
    const validationErrors = validationErrorsIn(req);

    if (validationErrors) {
      return;
    }
    User.createNew(req.body);
    res.redirect(routingPath + "login");
    transporter.sendMail({
      from: "samuelawesomeshop@online.com",
      to: email,
      subject: "User Sign Up successful",
      html: `<strong> Dear ${name} ,
      <br> You have successfully signed at samuelonlineshop.
      Welcome.Expect the best and feel at  home at the online shop you can trust`
    });
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.getLogin = (req, res, next) => {
  renderPage(req, res, "auth/login", "User Login", "login", "login");
};

exports.postLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const previousData = {
      email,
      password
    };
    const validationErrors = validationErrorsIn(req);
    if (validationErrors) {
      return renderPageWithError(validationErrors);
    }

    const user = await User.findOneWithCredentials(email, password);
    if (!user) {
      return renderPageWithError("Invalid Email or password");
    }
      
    const renderPageWithError = errorMessage => {
      res.render("auth/login", {
        pageTitle: "User Login",
        path: "login",
        postPath: "login",
        hasErrors: true,
        previousData: previousData,
        errorMessage: errorMessage
      });
    };
     req.session.isUserLoggedIn = true;
     req.session.user = user;
    return next();
  } catch (error) {
    errorHandler(error, next);
  }
};
exports.initializeSession = (req, res, next) => {
  try {
    console.log('About to intialize some session')
    req.session.save(err => {
      if (err) {
        throw new Error(err);
      } else {
        res.redirect("/products");
      }
    });
  } catch (error) {
    errorHandler(error, next);
  }
};
exports.getReset = (req, res, next) => {
  renderPage(
    req,
    res,
    "auth/resetPassword",
    "Reset Password",
    "reset",
    "reset"
  );
};

exports.postReset = async (req, res, next) => {
  try {
    const email = req.body.email;
    const previousData = {
      email
    };
    const validationErrors = validationErrorsIn(req);
    if (validationErrors) {
      return renderPageWithError(validationErrors);
    }
    const user = await User.findByEmail(email);
    if (!user) {
      return renderPageWithError('"No user by that email exists"');
    }
    const token = await TokenGenerator.createNewForId(user.id);
    console.log(token);
    transporter.sendMail({
      //http://localhost:3000/user/auth/newPassword/9062697904e80698f56f6b2fb66c1d8128b0c61c8c8a0476f1de14fc22200390
      from: "samuelsonlineshop@online.com",
      to: user.email,
      subject: "Reset Password",
      html: `<strong> Dear ${user.name}</strong>,
               <br><p>You can click this link to reset your password : <a href='http://localhost:3000/user/auth/newPassword/${token}'>
                Reset password</a></p>
               <p>Please note your have only one hour to reset your password</p>
               <br> Thank you `
    });
    res.render("userFeedback", {
      pageTitle: "Message",
      path: "userMessage",
      userMessage: `Dear ${user.name},
                A link has been sent to your email.Please click the link to reset your password`
    });
    const renderPageWithError = errorMessage => {
      res.render("auth/resetPassword", {
        pageTitle: "Reset Password",
        path: "reset",
        postPath: "reset",
        hasErrors: true,
        previousData: previousData,
        errorMessage: errorMessage
      });
    };
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.getNewPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const tokenDetails = await TokenGenerator.findTokenDetailsWithValidity(
      token
    );
    if (!tokenDetails) {
      return renderPageWithError("Too late for Reset.Try to reset again");
    }
    const tokenUserId = await TokenGenerator.getRequesterIdforToken(token);
    const resetUser = await User.findById(tokenUserId);
    res.render("auth/newPassword", {
      pageTitle: "New Password",
      path: "new password",
      postPath: "newPassword",
      errorMessage: "",
      hasErrors: false,
      Id: resetUser._id,
      token: token
    });
    const renderPageWithError = errorMessage => {
      res.render("auth/resetPassword", {
        pageTitle: "Reset Password",
        path: "reset",
        postPath: "newPassword",
        hasErrors: false,
        errorMessage: errorMessage
      });
    };
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.postNewPassword = async (req, res, next) => {
  try {
    const password = req.body.password;
    const userId = req.body.userId;
    const token = req.body.token;

    const previousData = {
      password
    };
    const validationErrors = validationErrorsIn(req);
    if (validationErrors) {
      return renderPageWithError(validationErrors);
    }

    const tokenDetails = await TokenGenerator.findTokenDetailsWithValidity(
      token
    );
    if (!tokenDetails) {
      return renderPageWithError(
        "You are not authorized to modify the password"
      );
    }
    const resetUser = await User.findById(tokenDetails.getRequesterId());
    await resetUser.resetPasswordTo(password);
    await TokenGenerator.deleteTokenById(tokenDetails.getTokenId());

    res.redirect(routingPath + "login");
    const renderPageWithError = errorMessage => {
      res.render("auth/newPassword", {
        pageTitle: "New Password",
        path: "new password",
        postPath: "newPassword",
        previousData: previousData,
        hasErrors: true,
        Id: userId,
        token: token,
        errorMessage: errorMessage
      });
    };
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      errorHandler(err, next);
    }
    res.redirect("/");
  });
};
