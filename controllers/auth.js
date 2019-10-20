const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  console.log(req.session);
  res.render("auth/login", {
    pageTitle: "login",
    path: "/auth/login"
  });
};


exports.getSignUp= (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Sign UP ",
    path: "/auth/signup"
  });
};


exports.postLogin = (req, res, next) => {
  User.findById("5da1f8947fb2132c1c7d450d")
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(err => {
        if (err) {
          console.log(err);
        }
        res.redirect("/");
      });
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    console.log("Deleted the current active session");
    res.redirect("/");
  });
};
