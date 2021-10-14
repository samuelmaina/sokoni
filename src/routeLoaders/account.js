const {account} = require("../routes");
const path = "/account";


module.exports = app => {
  app.use(path, account);
};
