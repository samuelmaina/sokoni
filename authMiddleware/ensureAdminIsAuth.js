module.exports = (req, res, next) => {
  if (!(req.session && req.session.isAdminLoggedIn))
    return res.redirect("/auth/admin/log-in");
  next();
};
