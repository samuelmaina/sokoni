const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "login",
    path: "login"
  });
};

exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Sign UP ",
    path: "signup"
  });
};

exports.postSignUp = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const ConfirmPassword = req.body.ConfirmPassword;
  User.findOne({ email: email })
    .then(user => {
      if (user || password !== ConfirmPassword) {
        return res.redirect("/signup");
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
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
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
              }else {
                res.redirect("/");
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
