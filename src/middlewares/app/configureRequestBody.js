module.exports = (app) => {
  function appendBody(req, res, next) {
    if (req.body.email) return next();

    if (req.session.body) {
      req.body = { ...req.session.body };
      req.session.body = null;
    }
    next();
  }
  app.use(appendBody);
};
