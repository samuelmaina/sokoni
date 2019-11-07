const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
require('dotenv').config();
// required for sending emails to the user for authentication details
const nodemailer = require("nodemailer");
const sendGridTransporter = require("nodemailer-sendgrid-transport");

const User = require("../models/user");

// this will be used to send emails using the sendgrid api
const transporter = nodemailer.createTransport(
  sendGridTransporter({
    auth: {
      api_key: process.env.SEND_GRID_API_KEY
    }
  })
);

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
    newUser.save().then(savedUser => {
      console.log(savedUser.email);
      return transporter
        .sendMail({
          to: savedUser.email,
          from: "samuelsonlineshop@online.com",
          subject: "SIgn Up at Online shop successful!!!",
          html:
            "<strong>You have successfully sign up at the online shop.  You can now login at the shop to see more offers that can make you happy all the days  of your life</strpng>"
        })
        .then(result => {
          res.redirect("/login"); //redirect to the login page after we have sent a sign up email.
        })
        .catch(err => console.log(err));
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
