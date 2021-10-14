const express = require("express");

const middlewares = require("./middlewares/app/index");

const routes = require("./routeLoaders/index");

const app = express();

for (const key in middlewares) {
  if (middlewares.hasOwnProperty(key)) {
    //the two middleware are supposed to be inserted after the routes have been loaded
    if (key === " errorHandler" || key === "notFound") continue;
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
