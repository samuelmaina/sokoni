const csurf = require('csurf');
module.exports = app => {
	app.use(csurf());
};
