const { setBodyAndUrl } = require("../../config/urls");

exports.addRedirectUrlAndCurrentBodyData = (req) => {
  const { originalUrl, body } = req;

  let isPostRequest = false;

  if (Object.keys(body).length > 0) {
    isPostRequest = true;
  }
  setBodyAndUrl(originalUrl, body, isPostRequest);
};
