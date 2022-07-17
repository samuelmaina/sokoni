const { setBodyAndUrl } = require("../../config/urls");

exports.addRedirectUrlAndCurrentBodyData = (req) => {
  const { originalUrl, body } = req;
  req.session.originalUrl = originalUrl;
  req.session.isPostRequest = body ? true : false;
  req.session.body = body;
};
