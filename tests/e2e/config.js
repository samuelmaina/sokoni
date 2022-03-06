const webdriver = require('selenium-webdriver');

const app = require('../../src/app');

const { connectToDb, closeConnectionToBd } = require('../config');

let server;

exports.TEST_PORT = 8080;

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
			//although the server unlistened from the current port, it is still running,
			//and jest will warn of some unstopped operations.
		}
	});
	await closeConnectionToBd();
};

exports.getNewDriverInstance = () => {
	try {
		return new webdriver.Builder()
			.withCapabilities(webdriver.Capabilities.chrome())
			.forBrowser('chrome')
			.build();
	} catch (error) {
		throw new Error(error);
	}
};
