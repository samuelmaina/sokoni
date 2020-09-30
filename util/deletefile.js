const fs = require("fs");

const deletefile = (filepath) => {
  fs.unlink(filepath, (err) => {
    if (err) {
      throw new Error(err);
    }
  });
};
module.exports = deletefile;
