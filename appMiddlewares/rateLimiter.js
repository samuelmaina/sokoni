const limiter = require('express-rate-limit');
const maxRequestPerWindow = 1000,
	windowPeriodHours = 1,
	message = `Exceeded ${maxRequestPerWindow} requests  allowed for ${windowPeriodHours} hour(s)`;
module.exports = app => {
	const limit = limiter({
		max: maxRequestPerWindow,
		windowMs: windowPeriodHours * 60 * 60 * 1000,
		message: message,
	});
	app.use(limit);
};
