const util = require('util');

// config should be imported before importing any other file
const config = require('./config/config');
const app = require('./config/express');
const mongoose = require('./config/mongo');
// const debug = require('debug')('express-mongoose-es6-rest-api:index');

// make bluebird default Promise
// Promise = require('bluebird'); // eslint-disable-line no-global-assign

app.use((err, req, res, next) => {
    res.locals.error = err;
    const status = err.status || 500;
    res.status(status);
    res.json('error');
  });

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
  });
}

module.exports = app;