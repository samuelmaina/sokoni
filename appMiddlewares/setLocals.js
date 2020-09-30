const loadAuth = (req, res) => {
  res.locals.isUserLoggedIn = req.session.isUserLoggedIn;
  res.locals.isAdminLoggedIn = req.session.isAdminLoggedIn;
};
const loadCsurfToken = (req, res) => {
  res.locals.csrfToken = req.csrfToken();
};
const loadErrors = (req, res) => {
  const error = req.flash("error");
  if (error.length > 0) res.locals.error = error[0];
  else res.locals.error = null;
};

const loadInfo = (req, res) => {
  const info = req.flash("info");
  if (info.length > 0) res.locals.info = info[0];
  else res.locals.info = null;
};
const loadPreviosData = (req, res) => {
  const previousData = req.flash("previous-data");
  if (previousData.length > 0) res.locals.previousData = previousData[0];
  else res.locals.previousData = {};
};

module.exports = (app) => {
  const setResLocals = (req, res, next) => {
    loadAuth(req, res);
    loadCsurfToken(req, res);
    loadErrors(req, res);
    loadInfo(req, res);
    loadPreviosData(req, res);
    next();
  };
  app.use(setResLocals);
};
