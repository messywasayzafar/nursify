const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const userId = event.queryStringParameters?.userId;
  const groupId = event.queryStringParameters?.groupId;

  if (!userId || !groupId) {
    return { statusCode: 400, body: 'Missing userId or groupId' };
  }

  try {
    await docClient.send(new PutCommand({
      TableName: 'WebSocketConnections',
      Item: {
        connectionId,
        userId,
        groupId,
        connectedAt: new Date().toISOString()
      }
    }));

    console.log(`User ${userId} connected to group ${groupId}`);
    return { statusCode: 200, body: 'Connected' };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: 'Failed to connect' };
  }
};
