class Renderer {
  /**
   *
   * @param {stream} res -the res stream
   *
   */
  constructor(res) {
    this._res = res;
    this._additionalResBodyData = {};
  }
  /**
   *
   * @param {path} templatePath -a path to the temperate page that you want
   * to render.
   */
  templatePath(templatePath) {
    this._templatePath = templatePath;
    return this;
  }

  /**
   *
   * @param {String} title -the title of Page
   */
  pageTitle(title) {
    this._title = title;
    return this;
  }
  /**
   *
   * @param {String} currentPath - name of the current active path
   * (or the route as displayed in the navigation bar).
   */
  activePath(currentPath) {
    this._path = currentPath;
    return this;
  }

  /**
   *
   * @param {String} postPath the path where forms will make post request.
   */
  pathToPost(postPath) {
    this._postPath = postPath;
    return this;
  }
  /**
   *
   * @param {*} error -error to be appended on the rendered page.
   */

  appendError(error) {
    this._error = error;
    return this;
  }
  /**
   *
   * @param {*} info -
   * info that will be appended
   * to the rendered page.
   */
  appendInfo(info) {
    this._info = info;
    return this;
  }

  appendSuccess(success) {
    this._success = success;
    return this;
  }
  /**
   *
   * @param {*} previousData -
   * append data to fields
   * as the previous data that
   * the fields had.
   */
  appendPreviousData(previousData = {}) {
    this._previousData = previousData;
    return this;
  }

  /**
   *
   * @param {object} options -res data that will be rendered in res.body
   */
  appendDataToResBody(options = {}) {
    for (const key in options) {
      this._additionalResBodyData[key] = options[key];
    }
    return this;
  }

  /**
   * render the page finally.
   * Note that you can not append another method after render is
   * called.
   */
  render() {
    const {
      _res,
      _templatePath,
      _title,
      _path,
      _postPath,
      _additionalResBodyData,
    } = this;

    //reject if title or the
    //templating path are missing.
    if (!_templatePath || !_title) {
      throw new Error("Template path and PageTitle must be provided");
    }
    //we should not override any data that
    //is in res.locals.
    const resLocals = _res.locals;
    const data = {
      pageTitle: _title,
      path: _path,
      postPath: _postPath,
      //resLocal previous data,error and
      //info take precedence over the currently
      //set previoud data.
      previousData: resLocals.previousData || this._previousData || {},
      error: resLocals.error || this._error,
      info: resLocals.info || this._info,
      success: resLocals.success || this._success,
    };

    //finally add  to data object any additional data that
    //was supposed to be added to res.body.
    for (const key in _additionalResBodyData) {
      if (_additionalResBodyData.hasOwnProperty(key)) {
        data[key] = _additionalResBodyData[key];
      }
    }

    return _res.render(_templatePath, data);
  }
}

module.exports = Renderer;
