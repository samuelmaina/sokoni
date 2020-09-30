class Renderer {
  /**
   *
   * @param {stream object} res -the res stream
   *
   */
  constructor(res) {
    this._res = res;
    return this;
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

  /**
   * render the page finally.Note that you can not append another method after render is
   * called.
   */
  render() {
    const { _res, _templatePath, _title, _path, _postPath } = this;
    return _res.render(_templatePath, {
      pageTitle: _title,
      path: _path,
      postPath: _postPath,
    });
  }
}

module.exports = Renderer;
