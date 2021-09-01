
const { AWS } = require('./aws-helper');

const dynamoClient = new AWS.DynamoDB.DocumentClient();


const TABLE_NAME = 'jobQueue';
const getTasks = async (req, res) => {
    const params = {
        TableName: TABLE_NAME,
    };
    console.log()
    const tasks = await dynamoClient.scan(params).promise();

    return res.json(tasks)
};

const getTaskById = async (id) => {
    const params = {
        TableName: TABLE_NAME,
        Id: id,
    };
    console.log(params);
    return await dynamoClient.get(params).promise();
};

const addOrUpdateTask = async (task) => {
    const params = {
        TableName: TABLE_NAME,
        Item: task,
    };
    return await dynamoClient.put(params).promise();
};

const deleteTask = async (id) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            id,
        },
    };
    return await dynamoClient.delete(params).promise();
};

const getNextTask = async (req, res) => {
    var params = {
        TableName: TABLE_NAME,
        ExpressionAttributeValues: {
            ':d': new Date().getTime()
           },
           FilterExpression: 'printedDate > :d',
        // IndexName: "customerId",
        // ExpressionAttributeValues: {
        //     ":v1": {
        //         Ndis: `${new Date().getTime()} < :processedDate`
        //     }
        // }//`${new Date().getTime()} < :processedDate`,
    };
``
    const result = await dynamoClient.scan(params).promise();
  
    return res.json(result.Items[0] || {});
}

const updateAfterPrint = async (req, res) => {
    
    const { printedId } = req.params;


    var params = {
        TableName:TABLE_NAME,
        Key:{
            "id": printedId
        },
        UpdateExpression: "set printedDate = :r",
        ExpressionAttributeValues:{
            ":r":new Date().getTime()
        },
        ReturnValues:"UPDATED_NEW"
    };

    console.log("Updating the item...");
    const result = await dynamoClient.update(params).promise();

    res.json(result);

    
}

module.exports = {
    dynamoClient,
    getTasks,
    getTaskById,
    addOrUpdateTask,
    deleteTask,
    getNextTask,
    updateAfterPrint
};

/*
  customerId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  imagelink: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  processedDate: {
      type: Date
  },
  createdDate: {
    type: Date
  },
  price: Number
*/
