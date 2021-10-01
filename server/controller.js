// const jwt = require('jsonwebtoken');
// const httpStatus = require('http-status');
const svgConverter = require('./helpers/svgConverter');
const path = require('path');
const { AWS } = require('./helpers/aws-helper');
const {addOrUpdateTask} = require('./helpers/dynamo');
const {AddToPrintQueue} = require('./helpers/aws-sqs');
const fs = require('fs');
const stripe = require("stripe")(process.env.STRIPE_KEY);
const uuid = require("uuid/v4");
//const PrintJob = require('./models/printJob')

var BucketName = "elevation-profiles";

var temp_dir = path.join(process.cwd(), 'tmp/');

const s3 = new AWS.S3();

async function sendSVGtoS3(id, path) {

    var body = fs.createReadStream(path);
    var s3obj = new AWS.S3({
        params: {
            Bucket: BucketName,
            Key: id,
            ACL: 'public-read'
        }
    });
    const stored = await s3obj.upload({ Body: body })
        .promise();
    return stored;

}

function deleteRecentlyUploaded(path) {
    try {
        fs.unlink(path, (err) => err ? console.log(err) : console.log('Temp Time Expired. Successfully deleted ' + path));
    } catch (e) {
        console.log(`Could not delete ${path} \n\n${e.toString()}`);
    }
}

async function draw(req, res) {
    const { img, name } = req.body;

    const { fileName, path } = await svgConverter.convertToImage({ name, svg: img });

    try {
        const uploadFileResponse = await sendSVGtoS3(fileName, path);

        res.setHeader('Content-Type', 'application/json');
        res.send({ response: "SUCCESS", next: '/payment', image: `https://elevation-profiles.s3.us-west-2.amazonaws.com/${fileName}` });
        deleteRecentlyUploaded(path);
    }
    catch (message) {
        res.status(500).send({ type: 'Error', message });
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

const calculateOrderAmount = items => {
    
    return 1400;
  };


async function createPaymentIntent(req, res) {
    const { items } = req.body;
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "usd"
    });
    res.send({
      clientSecret: paymentIntent.client_secret
    });
}

async function getPrintQueue(req, res){
    const results = await PrintJob.find({
        processedDate: { $gte: new Date() }

    })
    .sort({createdDate: 'asc'})
    .exec();

    return res.json(results);
}

function addToPrintQueue({name, address, imagelink, customerId, email, price}){
    // console.log('------------------');
    // console.log(JSON.stringify({name, address, imagelink, customerId, email, price}, null, 2));

    const now = new Date();

    const customerType = /*if race director code applied: 'dir' else */ 'ind'

    const item = {
        id: `${customerType}_${now.toISOString()}`,
        customerId, 
        createdDate: now.getTime(),
        name, 
        address, 
        imagelink, 
        email, 
        price, 
        printedDate: new Date(new Date().setMinutes(new Date().getMinutes() + 5)).getTime(),
        fulfilledDate: new Date(new Date().setMinutes(new Date().getMinutes() + 8)).getTime()
    }

    addOrUpdateTask(item);
}

// (async function() { 
//     addToPrintQueue({
//         name: "Ian Cropper",
//         address: "2398 Greenmeadows way, Ashland OR, 97520",
//         imagelink: "s3.amazon.com/something.png",
//         customerId: 144,
//         email: "itcropper@gmail.com",
//         price: 14.5
//     }
// )})();

async function checkout(req, res) {
    let error;
    let status;
    try {
        const { product, token, imageSource } = req.body;

        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });

        const idempotency_key = uuid();
        const charge = await stripe.charges.create(
            {
                amount: product.price * 100,
                metadata: {
                    imageSource
                },
                currency: "usd",
                customer: customer.id,
                receipt_email: token.email,
                description: `Purchased the ${product.name}`,
                shipping: {
                    name: token.card.name,
                    address: {
                        line1: token.card.address_line1,
                        line2: token.card.address_line2,
                        city: token.card.address_city,
                        country: token.card.address_country,
                        postal_code: token.card.address_zip
                    }
                }
            },
            {
                idempotency_key
            }
        );
        status = "success";
        
        const customerName = customer.name || (token && token.card && token.card.name);

        await addToPrintQueue({
            customerId: customer.id,
            name: customer.name || customerName, 
            email: token.email,
            imagelink: imageSource,
            price: product.price * 100,
            address: `${token.card.address_line1}\n${token.card.address_line2 ? token.card.address_line2 + '\n' : ''}${token.card.address_city}, ${token.card.address_state}\n${token.card.address_country}\n${token.card.address_zip}`})

    } catch (error) {
        console.error("Error:", error);
        status = "failure";
    }

    res.json({ error, status });
}

function enque(req, res){

    var a = Promise.resolve(AddToPrintQueue('hey'));

    return res.send(a);
}


module.exports = { draw, preview, createPaymentIntent, checkout, getPrintQueue, enque };

/*** token Schema
{
  "id": "tok_string",
  "object": "token",
  "card": {
    "id": "string",
    "object": "string",
    "address_city": "string",
    "address_country": "string",
    "address_line1": "string",
    "address_line1_check": "[unchecked | checked]",
    "address_line2": string,
    "address_state": "uppercase string, 2 characters",
    "address_zip": "string",
    "address_zip_check": "[unchecked | checked]",
    "brand": "[Visa|mastercard|etc...]",
    "country": "country code",
    "cvc_check": "unchecked",
    "dynamic_last4": null,
    "exp_month": number,
    "exp_year": number,
    "funding": "credit",
    "last4": "string",
    "name": "string",
    "tokenization_method": null
  },
  "client_ip": "ip address",
  "created": number,
  "email": "string@string",
  "livemode": false,
  "type": "card",
  "used": false
}


*/
