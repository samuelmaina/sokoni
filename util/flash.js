class Flash {
  constructor(req, res) {
    this._req = req;
    this._res = res;
    return this;
  }

  appendError(error) {
    const errorKey = "error";
    const {_req} = this;
    _req.flash(errorKey, error);
    return this;
  }
  appendPreviousData(previousData = {}) {
    const previousDataKey = "previous-data";
    const {_req} = this;
    _req.flash(previousDataKey, previousData);
    return this;
  }
  appendInfo(info) {
    const infoKey = "info";
    const {_req} = this;
    _req.flash(infoKey, info);
    return this;
  }

  /**
   *
   * @param {String} path
   * You can not chain anything else on redirect after calling it.
   */
  redirect(path) {
    const {_res, _req} = this;
    _req.session.save(err => {
      if (err) {
        throw new Error(err);
      }
      _res.redirect(path);
    });
  }
}
module.exports = Flash;
