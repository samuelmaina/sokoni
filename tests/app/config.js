const webdriver = require("selenium-webdriver");

const {connectToDb, closeConnectionToBd} = require("../config");

const app = require("../../app");

let server;

exports.startApp = async PORT => {
  await connectToDb();
  server = app.listen(PORT);
};
exports.closeApp = async () => {
  if (!server) {
    throw new Error("Server not start, so can't close");
  }
  server.close(err => {
    if (err) {
      throw new Error(err);
      //although unlistened on the current port, the server is still running,
      //and jest will warn of some unstopped operations.
    }
  });
  await closeConnectionToBd();
};

exports.getNewDriverInstance = () => {
  return new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .forBrowser("chrome")
    .build();
};
