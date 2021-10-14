const express = require("express");
const path = require("path");
const { resolvePath } = require("../../utils/fileManipulators");

module.exports = (app) => {
  app.use(express.static(resolvePath("public")));
  app.use("/data/images", express.static(path.resolve("data", "images")));
};
