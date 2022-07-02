exports.redirectUrlAndBody = {
  url: null,
  body: null,
  isPostRequest: null,
};

exports.setBodyAndUrl = (ip, url, body, isPostRequest) => {
  this.redirectUrlAndBody.url = url;
  this.redirectUrlAndBody.body = { ...body };
  this.redirectUrlAndBody.isPostRequest = isPostRequest;
};

exports.resetBodyAndUrl = () => {
  this.ip = null;
  this.redirectUrlAndBody.url = null;
  this.redirectUrlAndBody.body = null;
  this.redirectUrlAndBody.isPostRequest = null;
};
