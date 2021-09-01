const express = require('express');
const controller = require('./controller');
const config = require('../config/config');
const dynamo = require('./helpers/dynamo');

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
router
  .route('/draw')
  .post(controller.draw);

router
  .route('/image-preview')
  .get(controller.preview);

router
  .route("/create-payment-intent")
  .post(controller.createPaymentIntent);

router
  .route('/checkout')
  .post(controller.checkout);

router  
  .route('/jobs/all')
  .get(dynamo.getTasks)

router.route('/jobs/next').get(dynamo.getNextTask);

router.route('/jobs/printed/:printedId').put(dynamo.updateAfterPrint);

// router
//   .route('/addPrintJob')
//   .post(controller.addToPrintQueue);
  

module.exports = router;
