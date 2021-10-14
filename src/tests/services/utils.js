const fs = require("fs");
const path = require("path");

const { Product } = require("../../database/models");

exports.findExistingProducts = async () => {
  return await Product.find();
};

exports.createTestFile = function () {
  const sourceImage = path.resolve(`tests/data/images/insert.jpg`);
  const destination = path.resolve(`tests/data/image/`) + "-to-add.jpg";
  return new Promise((resolve, reject) => {
    fs.copyFile(sourceImage, destination, (err) => {
      if (err) return reject(err);
      resolve(destination);
    });
  });
};

exports.isFileExisting = function (filePath) {
  return fs.existsSync(filePath);
};
