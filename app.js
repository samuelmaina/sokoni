const express = require('express');
const path = require('path');

const middlewares = require('./appMiddlewares/index');

const routes = require('./routeLoaders/index');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data/images', express.static(path.join(__dirname, 'data', 'images')));

for (const key in middlewares) {
	if (middlewares.hasOwnProperty(key)) {
		//the two middleware are supposed to be inserted after the routes have been loaded so we skip them
		if (key === ' errorHandler' || key === 'notFound') continue;
		middlewares[key](app);
	}
}
//load routes
for (const key in routes) {
	if (routes.hasOwnProperty(key)) {
		routes[key](app);
	}
}

middlewares.notFound(app);
middlewares.errorHandler(app);

module.exports = app;
