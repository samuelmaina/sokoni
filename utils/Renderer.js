class Renderer {
  /**
   *
   * @param {stream} res -the res stream
   *
   */
  constructor(res) {
    this._res = res;
    this._options = {};
  }
  /**
   *
   * @param {path} templatePath -a path to the temperate page that you want
   * to send
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
   * (or the route as displayed by the navigation bar).
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

  appendError(error) {
    this._error = error;
    return this;
  }
  appendInfo(info) {
    this._info = info;
    return this;
  }
  /**
   *
   * @param {*} previousData -an object.
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
      this._options[key] = options[key];
    }
    return this;
  }

  /**
   * render the page finally.Note that you can not append another method after render is
   * called.
   */
  render() {
    const {_res, _templatePath, _title, _path, _postPath, _options} = this;
    if (!_templatePath || !_title) {
      throw new Error("Template path and PageTitle must be provided");
    }
    const resLocals = _res.locals;
    const data = {
      pageTitle: _title,
      path: _path,
      postPath: _postPath,
      previousData: resLocals.previousData || this._previousData || {},
      error: resLocals.error || this._error,
      info: resLocals.info || this._info,
    };
    for (const key in _options) {
      if (_options.hasOwnProperty(key)) {
        data[key] = _options[key];
      }
    }
    return _res.render(_templatePath, data);
  }
}

module.exports = Renderer;
