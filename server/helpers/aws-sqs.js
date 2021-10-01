const { AWS } = require('./aws-helper');

var sqs = new AWS.SQS({apiVersion: '2012-11-05'});


function AddToPrintQueue(message){
    var params = {
    // Remove DelaySeconds parameter and value for FIFO queues
    DelaySeconds: 10,
    MessageAttributes: {
        "Title": {
        DataType: "String",
        StringValue: "The Whistler"
        },
        "Author": {
        DataType: "String",
        StringValue: "John Grisham"
        },
        "WeeksOn": {
        DataType: "Number",
        StringValue: "6"
        }
    },
    MessageBody: "Information about current NY Times fiction bestseller for week of 12/11/2016.",
    // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
    // MessageGroupId: "Group1",  // Required for FIFO queues
    QueueUrl: "https://sqs.us-west-2.amazonaws.com/065407916720/TestQ1"
    };

    return new Promise((resolve, reject) => {
        sqs.sendMessage(params, function(err, data) {
                if (err) {
                    console.log({status: "error", message: err})
                    reject({status: "error", message: err});
                } else {
                    console.log({status: "Success", message: data.MessageId})
                    resolve({status: "Success", message: data.MessageId});
                }
            });
        });

}

function readFromQueue(){
    // Create an SQS service object

        var QueueUrl = "https://sqs.us-west-2.amazonaws.com/065407916720/TestQ1"

        var params = {
            AttributeNames: [
                "SentTimestamp"
            ],
            MaxNumberOfMessages: 10,
            MessageAttributeNames: [
                "All"
            ],
            QueueUrl,
            VisibilityTimeout: 20,
            WaitTimeSeconds: 0
        };

        sqs.receiveMessage(params, function(err, data) {
            if (err) {
                console.log("Receive Error", err);
            } else if (data.Messages) {
                var deleteParams = {
                QueueUrl: queueURL,
                ReceiptHandle: data.Messages[0].ReceiptHandle
                };
                sqs.deleteMessage(deleteParams, function(err, data) {
                if (err) {
                    console.log("Delete Error", err);
                } else {
                    console.log("Message Deleted", data);
                }
            });
        }
        });
}

module.exports = {AddToPrintQueue}

