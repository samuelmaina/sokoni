const request = require("request");
const { EMAIL, BASE_URL } = require("../../config/env");
const { EmailToken } = require("../../database/models");
const { baseAuth } = require("../../useCases");

const {
  validationResults,
  Renderer,
  Flash,
  emailSender,
  renderables,
} = require("../../utils");

const { logInRenderer } = renderables;

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
      adminSuccessfulLoginRedirect: "/admin/products?page=1",
      userSuccessfulLoginRedirect: "/products?page=1",
    };
  }

  getSignUp(req, res, next) {
    const renderer = new Renderer(res)
      .templatePath("auth/signup")
      .pageTitle(`${this.person} Sign Up`);
    if (this.type === "admin") {
      renderer.activePath("/admin/signup");
    } else {
      renderer.activePath("/signup");
    }
    renderer.pathToPost(this.routes.signUp).render();
  }

  async postSignUp(req, res, next) {
    try {
      const { body } = req;
      const flash = new Flash(req, res).appendPreviousData(body);

      const validationErrors = validationResults(req);

      const result = await baseAuth.signUp(
        body,
        this.type,
        validationErrors,
        this.Model,
        EmailToken,
        emailSender
      );

      if (result.error)
        return flash.appendError(result.error).redirect(this.routes.signUp);
      if (result.success) {
        return flash
          .appendSuccess("Sign Up successful.")
          .appendInfo(
            "Click the link sent to your email for account confirmation.You can still login without confirmation but confirmation may be required later."
          )
          .redirect(this.routes.logIn);
      }
    } catch (error) {
      next(error);
    }
  }

  sendEmailConfirmation(req, res, next) {
    try {
      const renderer = new Renderer(res)
        .templatePath("auth/confirm-email")
        .pageTitle(`Email Confirmation`);
      renderer.render();
    } catch (error) {
      next(error);
    }
  }
  async confirmEmail(req, res, next) {
    try {
      const flash = new Flash(req, res);
      const token = req.params.token;

      const result = await baseAuth.confirmEmail(token, EmailToken, this.Model);

      if (result.error) {
        return flash.appendError(result.error).redirect(this.routes.signUp);
      }
      if (result.success) {
        return flash.appendSuccess(result.info).redirect(this.routes.logIn);
      }
    } catch (error) {
      next(error);
    }
  }

  getLogin(req, res, next) {
    try {
      let activePath;
      if (this.type === "admin") {
        activePath = "/admin/login";
      } else {
        activePath = "/login";
      }
      return logInRenderer(
        res,
        this.person,
        activePath,
        this.routes.login
      ).render();
    } catch (error) {
      next(error);
    }
  }

  async postLogin(req, res, next) {
    try {
      const flash = new Flash(req, res).appendPreviousData(req.body);
      const { email, password } = req.body;
      const validationErrors = validationResults(req);
      if (validationErrors) {
        return flash.appendError(validationErrors).redirect(this.routes.logIn);
      }
      const document = await this.Model.findOneWithCredentials(email, password);
      if (!document) {
        return flash
          .appendError("Invalid Email or Password")
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
      req.session.user_id = req.document._id;
    }
  }

  successfulLoginRedirect(req) {
    return this.type === "admin"
      ? this.routes.adminSuccessfulLoginRedirect
      : this.routes.userSuccessfulLoginRedirect;
  }

  initializeSession(req, res, next) {
    try {
      this.setSessionAuth(req);
      return req.session.save((err) => {
        const url = this.successfulLoginRedirect(req);
        return res.redirect(url);
      });
    } catch (error) {
      next(error);
    }
  }

  getReset(req, res, next) {
    new Renderer(res)
      .templatePath("auth/resetPassword")
      .pageTitle(`${this.person} Reset Password`)
      .pathToPost(this.routes.reset)
      .render();
  }

  async postReset(req, res, next) {
    try {
      const flash = new Flash(req, res).appendPreviousData(req.body);
      const email = req.body.email;
      const validationErrors = validationResults(req);
      if (validationErrors) {
        return flash.appendError(validationErrors).redirect(this.routes.reset);
      }
      const document = await this.Model.findByEmail(email);
      if (!document) {
        return flash
          .appendError(` No ${this.person} by that email exists.`)
          .redirect(this.routes.reset);
      }
      const token = await EmailToken.createOneForEmail(email);

      emailSender({
        //http://localhost:3000/auth/user/new-password/57543e4605348c1d428f72eff767487bd255983f74119b2b221cab4f2c28bbf3
        from: EMAIL,
        to: document.email,
        subject: "Password Reset",
        html: `<strong> Dear ${document.name}</strong>,
			           <br><p>You can click this link to reset your password :
			           <a href=${BASE_URL}/auth/${this.type}/new-password/${token.token}>
			            Reset password</a></p>
			           <p>Please note your have only one hour to reset your password</p>
			           <br> Thank you `,
      })
        .then((result) => {
          flash
            .appendSuccess(
              "Reset Successful.A link has been sent to your email. Please click the link to reset password.If mail is not in the  inbox, look at the spam folder."
            )
            .redirect(this.routes.logIn);
        })
        .catch((err) => {
          flash
            .appendInfo(
              "You are offline. Get back online to reset your password."
            )
            .redirect(this.routes.logIn);
        });
    } catch (error) {
      next(error);
    }
  }

  async getNewPassword(req, res, next) {
    try {
      const flash = new Flash(req, res);
      const token = req.params.token;
      const tokenDetails = await EmailToken.findTokenDetailsByToken(token);
      if (!tokenDetails) {
        return flash
          .appendError("Too late for reset. Please try again.")
          .appendPreviousData()
          .redirect(this.routes.reset);
      }
      return new Renderer(res)
        .templatePath("auth/newPassword")
        .pageTitle("New Password")
        .pathToPost(this.routes.newPassword)
        .activePath("/login")
        .appendDataToResBody({
          token,
        })
        .render();
    } catch (error) {
      next(error);
    }
  }
  async postNewPassword(req, res, next) {
    try {
      const { password, token } = req.body;

      const renderer = new Renderer(res)
        .templatePath("auth/newPassword")
        .pageTitle("New Password")
        .pathToPost(this.routes.newPassword)
        .activePath("/login")
        .appendDataToResBody({
          token,
        })
        .appendPreviousData(req.body);

      const validationErrors = validationResults(req);
      if (validationErrors) {
        return renderer.appendError(validationErrors).render();
      }
      const tokenDetails = await EmailToken.findTokenDetailsByToken(token);
      const document = await this.Model.findByEmail(tokenDetails.email);
      const resettingToSamePassword = await document.isCorrect(password);
      if (resettingToSamePassword) {
        return renderer
          .appendError("Can not reset to your old Password! Select another one")
          .render();
      }
      await document.update("password", password);
      new Flash(req, res)
        .appendSuccess("Password reset successful.")
        .redirect(this.routes.logIn);
      await tokenDetails.delete();
    } catch (error) {
      next(error);
    }
  }

  logout(req, res, next) {
    req.session.destroy((err) => {
      if (err) {
        next(err);
      }
      res.redirect("/");
    });
  }
}

module.exports = Auth;
