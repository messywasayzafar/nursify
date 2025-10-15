const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { groupId } = event.pathParameters;
    const limit = parseInt(event.queryStringParameters?.limit || '50');

    const result = await docClient.send(new QueryCommand({
      TableName: process.env.MESSAGES_TABLE,
      IndexName: 'GroupIdIndex',
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeValues: { ':groupId': groupId },
      ScanIndexForward: false,
      Limit: limit
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true, 
        messages: result.Items?.reverse() || [] 
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
