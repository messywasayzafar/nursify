const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');

const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  console.log('SendMessage handler invoked:', JSON.stringify(event));
  
  const connectionId = event.requestContext.connectionId;
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  
  const body = JSON.parse(event.body);
  const { groupId, senderId, senderName, message, fileUrl, fileName } = body;

  console.log('Message details:', { groupId, senderId, senderName, messageLength: message?.length, fileUrl });

  if (!groupId || !senderId) {
    console.error('Missing required fields:', { groupId, senderId });
    return { statusCode: 400, body: 'Missing required fields' };
  }
  
  if (!message && !fileUrl) {
    console.error('Either message or fileUrl must be provided');
    return { statusCode: 400, body: 'Either message or fileUrl must be provided' };
  }

  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  try {
    // Store message in DynamoDB
    await docClient.send(new PutCommand({
      TableName: 'ChatMessages',
      Item: {
        messageId,
        groupId,
        senderId,
        senderName,
        message: message || '',
        timestamp,
        ...(fileUrl && { fileUrl }),
        ...(fileName && { fileName })
      }
    }));

    // Get all connections for this group
    console.log('Querying connections for group:', groupId);
    const connections = await docClient.send(new QueryCommand({
      TableName: 'WebSocketConnections',
      IndexName: 'GroupIdIndex',
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeValues: { ':groupId': groupId }
    }));
    
    console.log(`Found ${connections.Items?.length || 0} connections for group ${groupId}`);

    // Send message to all connected clients in the group
    const apiGateway = new ApiGatewayManagementApiClient({
      endpoint: `https://${domain}/${stage}`,
      region: 'us-east-1'
    });

    const messageData = JSON.stringify({
      action: 'message',
      messageId,
      groupId,
      senderId,
      senderName,
      message: message || '',
      timestamp,
      ...(fileUrl && { fileUrl }),
      ...(fileName && { fileName })
    });

    const sendPromises = (connections.Items || []).map(async (connection) => {
      try {
        console.log(`Sending message to connection: ${connection.connectionId}`);
        await apiGateway.send(new PostToConnectionCommand({
          ConnectionId: connection.connectionId,
          Data: messageData
        }));
        console.log(`Message sent successfully to: ${connection.connectionId}`);
      } catch (error) {
        console.error(`Error sending to connection ${connection.connectionId}:`, error);
        if (error.statusCode === 410 || error.$metadata?.httpStatusCode === 410) {
          console.log(`Removing stale connection: ${connection.connectionId}`);
          await docClient.send(new DeleteCommand({
            TableName: 'WebSocketConnections',
            Key: { connectionId: connection.connectionId }
          }));
        }
      }
    });

    await Promise.all(sendPromises);
    
    console.log('Message broadcast completed');
    return { statusCode: 200, body: 'Message sent' };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: 'Failed to send message' };
  }
};
