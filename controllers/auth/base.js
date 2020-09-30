require("dotenv").config();

// const transporter = require("../../util/emailSender");

const TokenGenerator = require("../../database/models/tokenGenerator");

const validationErrorsIn = require("../../util/validationResults");
const transporter = require("../../util/emailSender");
const Renderer = require("../../util/renderFunction");
const Flash = require("../../util/flash");

class Auth {
  constructor(Model, type) {
    this.Model = Model;
    if (type === "admin") this.person = "Admin";
    else this.person = "User";
    this.type = type;
    const baseRoute = `/auth/${this.type}`;
    this.routes = {
      signUp: `${baseRoute}/sign-up`,
      logIn: `${baseRoute}/log-in`,
      reset: `${baseRoute}/reset`,
      newPassword: `${baseRoute}/new-password`,
      adminSuccessfulLoginRedirect: "/admin/products",
      userSuccessfulLoginRedirect: "/products",
    };
  }

  getSignUp(req, res, next) {
    new Renderer(res)
      .templatePath("auth/signup")
      .pageTitle(`${this.person} Sign Up`)
      .activePath("sign up")
      .pathToPost(this.routes.signUp)
      .render();
  }
  async postSignUp(req, res, next) {
    try {
      const flash = new Flash(req, res);

      const previousData = req.body;

      const validationErrors = validationErrorsIn(req);
      if (validationErrors) {
        return flash
          .appendError(validationErrors)
          .appendPreviousData(previousData)
          .redirect(this.routes.signUp);
      }

      await this.Model.createNew(req.body);

      const successSignUpMessage = `Dear ${req.body.name} You have successfully signed up`;
      flash.appendInfo(successSignUpMessage).redirect(this.routes.logIn);
      // transporter.sendMail(emailBody);
    } catch (error) {
      next(error);
    }
  }

  getLogin(req, res, next) {
    try {
      new Renderer(res)
        .templatePath("auth/login")
        .pageTitle(`${this.person} Log In`)
        .activePath("login")
        .pathToPost(this.routes.logIn)
        .render();
    } catch (error) {
      next(error);
    }
  }

  async postLogin(req, res, next) {
    try {
      const flash = new Flash(req, res);
      const { email, password } = req.body;
      const previousData = req.body;
      const validationErrors = validationErrorsIn(req);
      if (validationErrors) {
        return flash
          .appendError(validationErrors)
          .appendPreviousData(previousData)
          .redirect(this.routes.logIn);
      }
      const document = await this.Model.findOneWithCredentials(email, password);
      if (!document) {
        return flash
          .appendError("Invalid Email or Password")
          .appendPreviousData(previousData)
          .redirect(this.routes.logIn);
      }
      req.document = document;
      return next();
    } catch (error) {
      next(error);
    }
  }

  setSessionAuth(req) {
    if (this.type === "admin") {
      req.session.isAdminLoggedIn = true;
      req.session.admin = req.document;
    } else {
      req.session.isUserLoggedIn = true;
      req.session.user = req.document;
    }
  }

  successfulLoginRedirect() {
    if (this.type === "admin") {
      return this.routes.adminSuccessfulLoginRedirect;
    } else {
      return this.routes.userSuccessfulLoginRedirect;
    }
  }

  renderNewPassword(res, tokenString) {
    res.render("auth/newPassword", {
      pageTitle: "New Password",
      path: "new Password",
      postPath: this.routes.newPassword,
      token: tokenString,
    });
  }
  initializeSession(req, res, next) {
    try {
      this.setSessionAuth(req);
      return req.session.save((err) => {
        if (err) throw new Error(err);
        res.redirect(this.successfulLoginRedirect());
      });
    } catch (error) {
      next(error);
    }
  }

  getReset(req, res, next) {
    new Renderer(res)
      .templatePath("auth/resetPassword")
      .pageTitle(`${this.person} Reset Password`)
      .activePath("reset")
      .pathToPost(this.routes.reset)
      .render();
  }

  async postReset(req, res, next) {
    try {
      const flash = new Flash(req, res);
      const email = req.body.email;
      const previousData = req.body;
      const validationErrors = validationErrorsIn(req);
      if (validationErrors) {
        return flash
          .appendError(validationErrors)
          .appendPreviousData(previousData)
          .redirect(this.routes.reset);
      }
      const document = await this.Model.findByEmail(email);
      if (!document) {
        return flash
          .appendError(` No ${this.person} by that email exits`)
          .appendPreviousData(previousData)
          .redirect(this.routes.reset);
      }
      const token = await TokenGenerator.createNewForId(document._id);
      console.log(token);
      // transporter.send({
      //   //http://localhost:3000/auth/admin/new-password/3be67eb7255a6f445942c97ccbb349af069aa737d76689cea6c58c4e04b4b209
      //   from: "samuelsonlineshop@online.com",
      //   to: document.email,
      //   subject: "Reset Password",
      //   html: `<strong> Dear ${document.name}</strong>,
      //            <br><p>You can click this link to reset your password :
      //            <a href='http://localhost:3000/${baseRoute}/newPassword/${token}'>
      //             Reset password</a></p>
      //            <p>Please note your have only one hour to reset your password</p>
      //            <br> Thank you `,
      // });
      flash
        .appendInfo(
          "A link has been sent into your email.Click on it to reset password"
        )
        .redirect(this.routes.logIn);
    } catch (error) {
      next(error);
    }
  }

  async getNewPassword(req, res, next) {
    try {
      const flash = new Flash(req, res);
      const tokenString = req.params.token;
      const tokenDetails = await TokenGenerator.findTokenDetails(tokenString);

      if (!tokenDetails) {
        return flash
          .appendError("Too late for reset.Please try again")
          .appendPreviousData()
          .redirect(this.routes.reset);
      }
      this.renderNewPassword(res, tokenString);
    } catch (error) {
      next(error);
    }
  }
  async postNewPassword(req, res, next) {
    try {
      const flash = new Flash(req, res);
      const password = req.body.password;
      const bodyToken = req.body.token;
      const previousData = req.body;
      const validationErrors = validationErrorsIn(req);
      if (validationErrors) {
        res.locals.error = validationErrors;
        res.locals.previousData = previousData;
        return this.renderNewPassword(res, bodyToken);
      }

      const token = await TokenGenerator.findTokenDetails(bodyToken);
      const document = await this.Model.findById(token.getRequesterId());
      const resettingToSamePassword = await document.checkIfPasswordIsValid(
        password
      );
      if (resettingToSamePassword) {
        res.locals.error =
          "That is still your old Password.Please submit new password for security reasons";
        res.locals.previousData = previousData;
        return this.renderNewPassword(res, bodyToken);
      }
      await document.resetPasswordTo(password);
      await TokenGenerator.deleteTokenById(token.id);
      flash.appendInfo("Password reset successful").redirect(this.routes.logIn);
    } catch (error) {
      next(error);
    }
  }

  postLogout(req, res, next) {
    req.session.destroy((err) => {
      if (err) {
        next(err);
      }
      res.redirect("/");
    });
  }
}

module.exports = Auth;
