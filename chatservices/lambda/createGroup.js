const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const group = {
      groupId,
      type: body.type || 'patient',
      patientId: body.patientId,
      name: body.name,
      createdBy: body.createdBy,
      createdAt: now,
      ...body
    };

    await docClient.send(new PutCommand({
      TableName: process.env.GROUPS_TABLE,
      Item: group
    }));

    await docClient.send(new PutCommand({
      TableName: process.env.MEMBERS_TABLE,
      Item: {
        memberId: `member_${Date.now()}`,
        groupId,
        userId: body.createdBy,
        role: 'creator',
        addedAt: now
      }
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, groupId, data: group })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
