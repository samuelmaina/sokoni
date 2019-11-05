const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const User = require("../models/user");

// const nodemailer=require('nodemailer');
// const sendgridTransporter=require('@sendgrid/mail');//configure the nodemailer-sendgrid-transport so that we can be able to send emails using the sendgrid package

// this will be used to send emails using the sendgrid api
// const transporter = nodemailer.createTransport(
//   sendgridTransporter({
//     auth: {
//       api_key:
//         "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"
//     }
//   })
// );

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  console.log(message);
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
          console.log(err);
        }
        const newUser = new User({
          name: name,
          email: email,
          password: result,
          cart: { items: [] }
        });
        newUser.save().then(result => res.redirect("/login"));
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
                console.log(err);
              } else {
                req.flash("error", "Invalid password or email");
                res.redirect("/products");
              }
            });
          } else {
            return res.redirect("/login");
          }
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};
