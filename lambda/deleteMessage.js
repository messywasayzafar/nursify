const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    const messageId = event.pathParameters?.messageId;
    console.log('Deleting messageId:', messageId);
    
    if (!messageId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'messageId is required' })
      };
    }

    await docClient.send(new DeleteCommand({
      TableName: 'ChatMessages',
      Key: { messageId }
    }));

    console.log('Delete successful');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, messageId })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
