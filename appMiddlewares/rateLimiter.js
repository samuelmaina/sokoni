const limiter = require('express-rate-limit');
module.exports = app => {
	const limit = limiter({
		max: 100, // limit each IP to 100 max requests per windowsMS
		windowMs: 60 * 60 * 1000, // 1 Hour
		message: 'Too many requests', // message to send
	});
	app.use(limit);
};
