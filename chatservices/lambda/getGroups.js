const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;

    const result = await docClient.send(new QueryCommand({
      TableName: process.env.MEMBERS_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    }));

    const groupIds = result.Items?.map(item => item.groupId) || [];
    const groups = [];

    for (const groupId of groupIds) {
      const groupResult = await docClient.send(new GetCommand({
        TableName: process.env.GROUPS_TABLE,
        Key: { groupId }
      }));
      if (groupResult.Item) groups.push(groupResult.Item);
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, groups })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
