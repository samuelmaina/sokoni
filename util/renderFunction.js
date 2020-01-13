const renderPageFunction= (req, res, renderPath, pageTitle, path, postPath) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render(renderPath, {
    pageTitle: pageTitle,
    path: path,
    postPath: postPath,
    errorMessage: message,
    hasErrors: false
  });
};

module.exports=renderPageFunction;