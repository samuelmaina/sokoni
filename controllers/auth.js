const crypto = require("crypto");

const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
require("dotenv").config();

// required for sending emails to the user for authentication details
const nodemailer = require("nodemailer");

const User = require("../models/user");

const errorHandler = require("../util/feedbackToUser").errorHandler;
const userMessage = require("../util/feedbackToUser").messageToUser;
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // also remember to turn on third party intervention in the account setting https://www.youtube.com/redirect?q=https%3A%2F%2Fmyaccount.google.com%2Flesssecureapps&v=NB71vyCj2X4&event=video_description&redir_token=sZ5_aOhjQQJNBvg3NBb4VZRn0nN8MTU3MzI0MDg0MkAxNTczMTU0NDQy
    user: "samuelmainaonlineshop@gmail.com",
    pass: process.env.GOOGLE_PASSWORD
  }
});

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "login",
    path: "login",
    errorMessage: message
  });
};

exports.getSignUp = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "Sign UP ",
    path: "signup",
    errorMessage: message
  });
};

exports.postSignUp = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Sign UP ",
      path: "signup",
      errorMessage: errors.array()[0].msg
    });
  }
  bcrypt.hash(password, 12, (err, result) => {
    if (err) {
      errorHandler(err, next);
    }
    const newUser = new User({
      name: name,
      email: email,
      password: result,
      cart: { items: [] }
    });
    newUser.save().then(savedUser => {
      res.redirect("/login"); //to make the application faster since sending emails take time
      return transporter
        .sendMail({
          from: "samuelsonlineshop@online.com",
          to: email,
          subject: "SIgn Up at Online shop successful!!!",
          html: `<strong> Dear ${name}, <br> You have successfully sign up at the online shop.  You can now login at the shop to see more offers that can make you happy all the days  of your life</strpng>`
        })
        .catch(err => errorHandler(err, next));
    });
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash("error", "Invalid password or email");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then(isPwdValid => {
          if (isPwdValid) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              if (err) {
                errorHandler(err, next);
              } else {
                req.flash("error", "Invalid password or email");
                res.redirect("/products");
              }
            });
          } else {
            return res.redirect("/login");
          }
        })
        .catch(err => errorHandler(err, next));
    })
    .catch(err => errorHandler(err, next));
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/resetPassword", {
    pageTitle: "Reset Password",
    path: "reset",
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      errorHandler(err, next);
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.render("auth/resetPassword", {
            pageTitle: "Reset Password",
            path: "reset",
            errorMessage: "No user by that email exists"
          });
        }
        user.resetToken = token;
        user.tokenExpiration = Date.now() + 60 * 60 * 1000;
        user.save().then( saved=>{
          transporter
          .sendMail({
            from: "samuelsonlineshop@online.com",
            to: user.email,
            subject: "Reset Password",
            html: `<strong> Dear ${user.name}</strong>,
             <br><p>You can click this link to reset your password : <a href='http://localhost:3000/reset/${token}'>
             Reset password</a></p>
             <p>Please note your have only one hour to reset your password</p>
            <br> Thank you `
          })
          .then(result => {
            let message=`Dear ${user.name},
            A link has been sent to your email.Please click the link to reset your password`
            return res.render("userFeedback", {
              pageTitle: "Message",
              path: "userMessage",
              isAuthenticated: req.session.isLoggedIn,
              isAdmin: req.session.isAdmin,
             userMessage: message
            });   
        } )
}).catch(err => errorHandler(err, next))
}).catch(err => errorHandler(err, next))
})
};


exports.getNewPassword = (req, res, next) => {
  User.findOne({
    resetToken: req.params.token,
    tokenExpiration: { $gt: Date.now() }
  })
    .then(resetUser => {
      if (!resetUser) {
        return res.render("auth/resetPassword", {
          pageTitle: "Reset Password",
          path: "reset",
          errorMessage: "Too late for the rest. Please try again"
        });
      }

      resetUser.tokenExpiration = undefined;

      resetUser
        .save()
        .then(result => {
          res.render("auth/newPassword", {
            pageTitle: "New Password",
            path: "new password",
            errorMessage: "",
            userId: resetUser.id,
            token: resetUser.resetToken
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.token;
  User.findOne({ resetToken: token, _id: userId })
    .then(user => {
      if (!user) {
        return res.render("auth/newPassword", {
          pageTitle: "New Password",
          path: "new password",
          errorMessage: "You are not authorized to modify the password"
        });
      }

      bcrypt.hash(newPassword, 12, (err, result) => {
        if (err) {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        }
        user.resetToken = undefined;
        user.password = result;
        user
          .save()
          .then(savedUser => {
            res.redirect("/login");
          })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
    res.redirect("/");
  });
};
