const bodyParser = require('body-parser');
module.exports = app => {
	const conf = bodyParser.urlencoded({
		extended: false,
		limit: '100kb',
	});
	app.use(conf);
};
