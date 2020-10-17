module.exports = app => {
  const errorHandlerMiddleware = (error, req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.isUserLoggedIn = req.session.isUserLoggedIn;
    res.locals.isAdminLoggedIn = req.session.isAdminLoggedIn;
    res.locals.error = "";
    res.locals.info = "";
    let statusCode = error.httpStatusCode || 500;
    console.log(error);
    res.status(statusCode).render("errorPage", {
      pageTitle: "Error!",
      path: "/500",
      errorMessage: error,
    });
    next();
  };
  app.use(errorHandlerMiddleware);
};
