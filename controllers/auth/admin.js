require("dotenv").config();

const transporter = require("../../util/emailSender");

const { Admin } = require("../../database/interfaces/auth");
const TokenGenerator=require('../../database/models/tokenGenerator');

const errorHandler = require("../../util/errorHandler");
const validationErrorsIn = require("../../util/validationResults");

const renderPage = require("../../util/renderFunction");

const routingPath = "admin/auth/";

exports.getAdminSignUp = (req, res, next) => {
  renderPage(
    req,
    res,
    "auth/signup",
    "Administrator Sign In",
    "signup",
    "signup"
  );
};

exports.postAdminSignUp = async (req, res, next) => {
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
    const renderPageWithError = errorMessage => {
      res.render("auth/signup", {
        pageTitle: "Administrator Sign In",
        path: "signup",
        postPath: "signup",
        hasErrors: true,
        errorMessage: errorMessage,
        previousData: previousData
      });
    };
    if (validationErrors) {
      return renderPageWithError(validationErrors);
    }
    Admin.createNew(req.body);
    res.redirect("login");
    transporter.sendMail({
      from: "samuelawesomeshop@online.com",
      to: email,
      subject: "Admin Sign Up successful",
      html: `<strong> Dear ${name} ,
      <br> You have successfully signed in as an admin
      .Login to do the following:
       </strong><br><p>add products<br><p>edit products</p><br>
       <p>And do much more as an admin</p>`
    });  
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.getLogin = (req, res, next) => {
  renderPage(req, res, "auth/login", "Administrator Login", "login", "login");
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
     const renderPageWithError = errorMessage => {
       res.render("auth/login", {
         pageTitle: "Administrator Login",
         path: "login",
         postPath: "login",
         previousData: previousData,
         hasErrors: true,
         errorMessage: errorMessage
       });
     };
    if (validationErrors) {
      return renderPageWithError(validationErrors);
    }
    const admin = await Admin.findOneWithCredentials(email, password);
    if (!admin) {
      return renderPageWithError("Invalid Email or Password");
    }
   
    req.admin=admin;
    return next()
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.initializeSession = (req, res, next) => {
  try {
      req.session.isAdminLoggedIn = true;
      req.session.admin = req.admin;
    return req.session.save(err => {
      if (err) throw new Error(err);
      res.redirect("/admin/products");
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
    " Admin resetPassword",
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
    const renderPageWithError = errorMessage => {
      res.render("auth/resetPassword", {
        pageTitle: "Admin resetPassword",
        path: "reset",
        postPath: "reset",
        hasErrors: true,
        previousData: previousData,
        errorMessage: errorMessage
      });
    };
    if (validationErrors) {
      return renderPageWithError(validationErrors);
    }
    const resetAdmin = await Admin.findByEmail(email);
    if (!resetAdmin) {
      return renderPageWithError("No Admin by that name exists");
    }
    const token = await TokenGenerator.createTokenForId(resetAdmin._id);
    console.log(token);
    transporter.sendMail({
      //http://localhost:3000/admin/auth/newPassword/efbba6090b5afba6c290e20b6fc36423e16c5470a2660c3f58db9211d7c6e1f8
      from: "samuelsonlineshop@online.com",
      to: resetAdmin.email,
      subject: "Reset Password",
      html: `<strong> Dear ${resetAdmin.name}</strong>,
               <br><p>You can click this link to reset your password : 
               <a href='http://localhost:3000/${routingPath}/newPassword/${token}'>
                Reset password</a></p>
               <p>Please note your have only one hour to reset your password</p>
               <br> Thank you `
    });
    res.render("userFeedback", {
      pageTitle: "Message",
      path: "userMessage",
      userMessage: `Dear ${resetAdmin.name},
                A link has been sent to your email.
                Please click the link to reset your password`
    });
    
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.getNewPassword = async (req, res, next) => {
  try {
    const tokenString = req.params.token;
     const renderPageWithError = errorMessage => {
       res.render("auth/resetPassword", {
         pageTitle: "Reset Password",
         path: "reset",
         postPath: "reset",
         hasErrors: false,
         errorMessage: errorMessage
       });
     };
    const tokenDetails = await TokenGenerator.findTokenDetails(
      tokenString
    );

    if (!tokenDetails) {
      return renderPageWithError("Too late for the reset. Please try again");
    }
    const tokenAdminId = tokenDetails.getRequesterId();
    const admin = await Admin.findById(tokenAdminId);
    res.render("auth/newPassword", {
      pageTitle: "New Password",
      path: "new Password",
      postPath: "newPassword",
      hasErrors: false,
      errorMessage: "",
      Id: admin._id,
      token: tokenString
    });
   
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.postNewPassword = async (req, res, next) => {
  try {
    const Id = req.body.Id;
    const password = req.body.password;
    const bodyToken = req.body.token;
    const previousData = {
      password
    };
    const validationErrors = validationErrorsIn(req);
    const renderPageWithError = errorMessage => {
      res.render("auth/newPassword", {
        pageTitle: "New Password",
        path: "new Password",
        postPath: "newPassword",
        hasErrors: true,
        Id: Id,
        previousData: previousData,
        errorMessage: errorMessage,
        token: bodyToken
      });
    };
    if (validationErrors) {
      return renderPageWithError(validationErrors);
    }
    const token = await TokenGenerator.findTokenDetails(bodyToken);
    const resetAdmin = await Admin.findById(token.getRequesterId());
    if (!resetAdmin) {
      return renderPageWithError("You are not authorised to change Password");
    }
    await resetAdmin.resetPasswordTo(password);
    await Token.deleteTokenById(token.id);
    res.redirect("/admin/auth/login");

    
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
