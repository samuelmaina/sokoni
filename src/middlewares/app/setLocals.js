const loadAuth = (req, res, next) => {
  try {
    res.locals.isUserLoggedIn = req.session.isUserLoggedIn;
    res.locals.isAdminLoggedIn = req.session.isAdminLoggedIn;
  } catch (error) {
    next(error);
  }
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
const loadErrors = (req, res, next) => {
  try {
    const error = req.flash("error");
    if (error.length > 0) res.locals.error = error[0];
    else res.locals.error = null;
  } catch (error) {
    next(error);
  }
};

const loadInfo = (req, res, next) => {
  try {
    const info = req.flash("info");
    if (info.length > 0) res.locals.info = info[0];
    else res.locals.info = null;
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
    loadErrors(req, res, next);
    loadInfo(req, res, next);
    loadPreviosData(req, res, next);
    loadAuth(req, res, next);
    setNoOfCartProducts(req, res, next);
    next();
  };
  app.use(setResLocals);
};
