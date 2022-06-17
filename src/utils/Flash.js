class Flash {
  constructor(req, res) {
    this._req = req;
    this._res = res;
  }

  appendError(error) {
    const errorKey = "error";
    const { _req } = this;
    _req.flash(errorKey, error);
    return this;
  }
  appendPreviousData(previousData = {}) {
    const previousDataKey = "previous-data";
    const { _req } = this;
    _req.flash(previousDataKey, previousData);
    return this;
  }
  appendInfo(info) {
    const infoKey = "info";
    const { _req } = this;
    _req.flash(infoKey, info);
    return this;
  }

  appendSuccess(success) {
    const successKey = "success";
    const { _req } = this;
    _req.flash(successKey, success);
    return this;
  }

  /**
   * You can not chain anything else on redirect after calling it.
   * @param {String} path
   */
  redirect(path) {
    const { _res } = this;
    _res.redirect(path);
  }
}
module.exports = Flash;
