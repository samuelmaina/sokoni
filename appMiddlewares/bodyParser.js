const bodyParser = require('body-parser');
module.exports = app => {
	const conf = bodyParser.urlencoded({
		extended: false,
		limit: '50MB',
	});
	app.use(conf);
};
