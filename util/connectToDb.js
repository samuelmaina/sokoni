const mongoose = require("mongoose");
module.exports = (mongo_uri, app, PORT) => {
  mongoose
    .connect(mongo_uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    })
    .then(connection => {
      if (connection) app.listen(PORT);
    })
    .catch(err => {
      throw new Error(err);
    });
};
