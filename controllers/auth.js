
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
require("dotenv").config(); //used to configure environment variables.


const nodemailer = require("nodemailer");

const User = require("../models/user");
const Token = require("../models/token");

const errorHandler = require("../util/errorHandler");

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
    errorMessage: message,
    postPath: "/signup"
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
      postPath: "signup",
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
    postPath: "/login",
    errorMessage: message
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
    postPath: "/reset",
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.render("auth/resetPassword", {
          pageTitle: "Reset Password",
          path: "reset",
          postPath: "/reset",
          errorMessage: "No user by that email exists"
        });
      }
      const token = new Token({
        email: user.email
      });
      token.setExpiration();
      token.generateTokenString();
      token.save();
      console.log(token);
      transporter
        .sendMail({
          from: "samuelsonlineshop@online.com",
          to: token.email,
          subject: "Reset Password",
          html: `<strong> Dear ${user.name}</strong>,
               <br><p>You can click this link to reset your password : <a href='http://localhost:3000/newPassword/${token.tokenString}'>
                Reset password</a></p>
               <p>Please note your have only one hour to reset your password</p>
               <br> Thank you `
        })
        .then(result => {
          let message = `Dear ${user.name},
                A link has been sent to your email.Please click the link to reset your password`;
          return res.render("userFeedback", {
            pageTitle: "Message",
            path: "userMessage",
            isAuthenticated: req.session.isLoggedIn,
            isAdmin: req.session.isAdmin,
            userMessage: message
          });
        });
    })
    .catch(err => errorHandler(err, next));
};

exports.getNewPassword = (req, res, next) => {
  Token.findOne({ tokenString: req.params.token })
    .then(sentToken => {
      console.log(sentToken);
      if (!sentToken || !sentToken.isTokenExpired()) {
        return res.render("auth/resetPassword", {
          pageTitle: "Reset Password",
          path: "reset",
          postPath: "/newPassword",
          errorMessage: "Too late for the rest. Please try again"
        });
      }

      User.findOne({
        email: sentToken.email
      })
        .then(resetUser => {
          res.render("auth/newPassword", {
            pageTitle: "New Password",
            path: "new password",
            postPath: "/newPassword",
            errorMessage: "",
            userId: resetUser.id,
            token: sentToken.tokenString
          });
        })
        .catch(err => errorHandler(err, next));
    })
    .catch(err => errorHandler(err, next));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.token;
  Token.findOne({ tokenString: token })
    .then(sentToken => {
      if (!sentToken || !sentToken.isTokenExpired()) {
        return res.render("auth/newPassword", {
          pageTitle: "New Password",
          path: "new password",
          postPath: "/newPassword",
          errorMessage: "You are not authorized to modify the password"
        });
      }
      User.findById(userId)
        .then(user => {
          bcrypt.hash(newPassword, 12, (err, result) => {
            if (err) {
              errorHandler(err, next);
            }
            user.password = result;
            user
              .save()
              .then(savedUser => {
                Token.findByIdAndDelete(sentToken._id).then(done => {
                  res.redirect("/login");
                }).catch(err=>errorHandler(err,next));
              })
              .catch(err => errorHandler(err, next));
          });
        })
        .catch(err => errorHandler(err, next));
    })
    .catch(err => errorHandler(err, next));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      errorHandler(err,next)
    }
    res.redirect("/");
  });
};
