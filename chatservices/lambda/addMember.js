const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { groupId } = event.pathParameters;
    const body = JSON.parse(event.body);
    const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const group = await docClient.send(new GetCommand({
      TableName: process.env.GROUPS_TABLE,
      Key: { groupId }
    }));

    if (!group.Item) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'Group not found' })
      };
    }

    await docClient.send(new PutCommand({
      TableName: process.env.MEMBERS_TABLE,
      Item: {
        memberId,
        groupId,
        userId: body.userId,
        role: body.role || 'member',
        addedAt: new Date().toISOString()
      }
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, memberId })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
