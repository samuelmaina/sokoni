const Renderer = require("./Renderer");

exports.logInRenderer = (res, type, activePath, postPath) => {
  return new Renderer(res)
    .templatePath("auth/login")
    .pageTitle(`${type} Log In`)
    .activePath(activePath)
    .activePath("/login")
    .pathToPost(postPath);
};
