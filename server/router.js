const express = require('express');
const controller = require('./controller');
const config = require('../config/config');

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
router
  .route('/draw')
  .post(controller.draw);

router
  .route('/image-preview')
  .get(controller.preview);

module.exports = router;
