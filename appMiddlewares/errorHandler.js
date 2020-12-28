module.exports = app => {
  const errorHandlerMiddleware = (error, req, res, next) => {
    //the setResLocals is not called so
    //we need to set them manually.
    res.locals.csrfToken = req.csrfToken();
    res.locals.isUserLoggedIn = req.session.isUserLoggedIn;
    res.locals.isAdminLoggedIn = req.session.isAdminLoggedIn;
    //solve csurf errors by redirecting to the  home page.
    if (error.code === "EBADCSRFTOKEN") {
      return res.redirect("/");
    }
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
