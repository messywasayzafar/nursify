const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const { requestContext, body } = event;
  const { connectionId, routeKey, domainName, stage } = requestContext;

  try {
    if (routeKey === '$connect') {
      const userId = event.queryStringParameters?.userId;
      const groupId = event.queryStringParameters?.groupId;
      await docClient.send(new PutCommand({
        TableName: process.env.CONNECTIONS_TABLE,
        Item: { connectionId, userId, groupId, connectedAt: new Date().toISOString() }
      }));
      return { statusCode: 200, body: 'Connected' };
    }

    if (routeKey === '$disconnect') {
      await docClient.send(new PutCommand({
        TableName: process.env.CONNECTIONS_TABLE,
        Item: { connectionId, disconnectedAt: new Date().toISOString() }
      }));
      return { statusCode: 200, body: 'Disconnected' };
    }

    if (routeKey === 'sendMessage') {
      const data = JSON.parse(body);
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      await docClient.send(new PutCommand({
        TableName: process.env.MESSAGES_TABLE,
        Item: {
          messageId,
          groupId: data.groupId,
          senderId: data.senderId,
          senderName: data.senderName,
          message: data.message,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          timestamp
        }
      }));

      const members = await docClient.send(new QueryCommand({
        TableName: process.env.MEMBERS_TABLE,
        IndexName: 'GroupIdIndex',
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues: { ':groupId': data.groupId }
      }));

      const apiGateway = new ApiGatewayManagementApiClient({
        endpoint: `https://${domainName}/${stage}`
      });

      const messagePayload = {
        action: 'message',
        messageId,
        groupId: data.groupId,
        senderId: data.senderId,
        senderName: data.senderName,
        message: data.message,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        timestamp
      };

      for (const member of members.Items || []) {
        const connections = await docClient.send(new QueryCommand({
          TableName: process.env.CONNECTIONS_TABLE,
          IndexName: 'UserIdIndex',
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: { ':userId': member.userId }
        }));

        for (const conn of connections.Items || []) {
          try {
            await apiGateway.send(new PostToConnectionCommand({
              ConnectionId: conn.connectionId,
              Data: JSON.stringify(messagePayload)
            }));
          } catch (e) {
            console.error('Failed to send to connection:', e);
          }
        }
      }

      return { statusCode: 200, body: 'Message sent' };
    }

    return { statusCode: 400, body: 'Invalid route' };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
