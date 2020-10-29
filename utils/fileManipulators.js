const fs = require("fs");
const path = require("path");

exports.resolvePath = pathString => {
  return path.resolve(pathString);
};

exports.deleteFile = filePath => {
  const path = this.resolvePath(filePath);
  fs.exists(path, exists => {
    if (exists) {
      fs.unlink(path, err => {
        if (err) {
          throw new Error(err);
        }
      });
    }
  });
};
