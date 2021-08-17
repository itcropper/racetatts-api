// const jwt = require('jsonwebtoken');
// const httpStatus = require('http-status');
 const svgConverter = require('./helpers/svgConverter');
 const path = require('path');
// const config = require('../../config/config');

// // sample user, used for authentication
// const user = {
//   username: 'react',
//   password: 'express'
// };



// function login(req, res, next) {
//   // Ideally you'll fetch this from the db
//   // Idea here was to show how jwt works with simplicity
//   if (req.body.username === user.username && req.body.password === user.password) {
//     const token = jwt.sign({
//       username: user.username
//     }, config.jwtSecret);
//     return res.json({
//       token,
//       username: user.username
//     });
//   }

//   const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
//   return next(err);
// }



// function getRandomNumber(req, res) {
//   // req.user is assigned by jwt middleware if valid token is provided
//   return res.json({
//     user: req.user,
//     num: Math.random() * 100
//   });
// }

async function draw(req, res) {
    const {img, name} = req.body;

    const uploaded = await svgConverter.convertToImage({name, svg: img});
  
    res.setHeader('Content-Type', 'application/json');
    if(uploaded.status === true){
      res.send({ response: "SUCCESS", next: '/payment', image: uploaded.path  });
    }else{
        res.status(500).send('Error', uploaded.error);
    }
}

function preview(req, res) {
    const {image} = req.query;

    try {
        res.sendFile( path.join(__dirname,'../uploaded/', image))
    }catch(e){
        res.status(500).send("Could not find image\n\n" + e.toString())
    }
}

module.exports = { draw, preview };
