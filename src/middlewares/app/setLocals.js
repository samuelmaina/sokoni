const loadAuth = (req, res, next) => {
  try {
    res.locals.isUserLoggedIn = req.session.isUserLoggedIn;
    res.locals.isAdminLoggedIn = req.session.isAdminLoggedIn;
  } catch (error) {
    next(error);
  }
};

const setName = (req, res, next) => {
  let name = null;
  const user = req.user;
  const admin = req.session ? req.session.admin : null;
  if (user) {
    name = user.name;
  }
  if (admin) {
    name = admin.name;
  }
  res.locals.name = name;
};

const setNoOfCartProducts = (req, res, next) => {
  try {
    res.locals.noOfCartProducts = req.user ? req.user.cart.length : null;
  } catch (error) {
    next(error);
  }
};
const loadCsurfToken = (req, res, next) => {
  try {
    res.locals.csrfToken = req.csrfToken();
  } catch (error) {
    next(error);
  }
};
const loadFeedback = (req, res, next) => {
  try {
    const error = req.flash("error");
    const info = req.flash("info");
    const success = req.flash("success");

    if (error.length > 0) res.locals.error = error[0];
    else res.locals.error = null;
    if (info.length > 0) res.locals.info = info[0];
    else res.locals.info = null;
    if (success.length > 0) res.locals.success = success[0];
    else res.locals.success = null;
  } catch (error) {
    next(error);
  }
};

const loadPreviosData = (req, res, next) => {
  try {
    const previousData = req.flash("previous-data");
    if (previousData.length > 0) res.locals.previousData = previousData[0];
    else res.locals.previousData = null;
  } catch (error) {
    next(error);
  }
};

module.exports = (app) => {
  const setResLocals = (req, res, next) => {
    loadCsurfToken(req, res, next);
    loadFeedback(req, res, next);
    loadPreviosData(req, res, next);
    loadAuth(req, res, next);
    setNoOfCartProducts(req, res, next);
    setName(req, res, next);
    next();
  };
  app.use(setResLocals);
};
