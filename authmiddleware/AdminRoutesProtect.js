module.exports = (req, res, next) => {
  if (!req.session.isAdminLoggedIn) {
    res.redirect("/auth/admin/log-in");
  }
  next();
};
