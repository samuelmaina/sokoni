const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  res.render("auth/login", {
    pageTitle: "login",
    path: "/auth/login"
  });
};
exports.postLogin = (req, res, next) => {
  req.session.isLoggedIn = true;
  User.findById("5da1f8947fb2132c1c7d450d")
  .then(user => {
    console.log('Entering the found user in the session');
    req.session.user=user;
    
    console.log(user);
  })
  .catch(err => console.log(err));
  res.redirect("/");
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
