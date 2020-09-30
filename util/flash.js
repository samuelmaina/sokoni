class Flash {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    return this;
  }

  appendError(error) {
    const errorKey = "error";
    const { req } = this;
    req.flash(errorKey, error);
    return this;
  }
  appendPreviousData(previousData = {}) {
    const previousDataKey = "previous-data";
    const { req } = this;
    req.flash(previousDataKey, previousData);
    return this;
  }
  appendInfo(info) {
    const infoKey = "info";
    const { req } = this;
    req.flash(infoKey, info);
    return this;
  }
  redirect(path) {
    const { res } = this;
    return res.redirect(path);
  }
}
module.exports = Flash;
