const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function testConnections() {
  console.log('🔍 Checking WebSocket Connections...\n');

  try {
    // Check connections
    const connectionsResult = await docClient.send(new ScanCommand({
      TableName: 'WebSocketConnections'
    }));

    console.log(`📊 Total Active Connections: ${connectionsResult.Items?.length || 0}\n`);

    if (connectionsResult.Items && connectionsResult.Items.length > 0) {
      console.log('Active Connections:');
      connectionsResult.Items.forEach((conn, index) => {
        console.log(`\n${index + 1}. Connection ID: ${conn.connectionId}`);
        console.log(`   User ID: ${conn.userId}`);
        console.log(`   Group ID: ${conn.groupId}`);
        console.log(`   Connected At: ${conn.connectedAt}`);
      });
    } else {
      console.log('⚠️ No active connections found');
      console.log('💡 Make sure users are connected to the chat');
    }

    console.log('\n' + '='.repeat(50));

    // Check group members
    const membersResult = await docClient.send(new ScanCommand({
      TableName: 'GroupMembers'
    }));

    console.log(`\n📊 Total Group Members: ${membersResult.Items?.length || 0}\n`);

    if (membersResult.Items && membersResult.Items.length > 0) {
      // Group by groupId
      const groupedMembers = {};
      membersResult.Items.forEach(member => {
        if (!groupedMembers[member.groupId]) {
          groupedMembers[member.groupId] = [];
        }
        groupedMembers[member.groupId].push(member);
      });

      console.log('Members by Group:');
      Object.entries(groupedMembers).forEach(([groupId, members]) => {
        console.log(`\n📁 Group: ${groupId}`);
        members.forEach((member, index) => {
          console.log(`   ${index + 1}. User: ${member.userId} (${member.role})`);
        });
      });
    } else {
      console.log('⚠️ No group members found');
    }

    console.log('\n' + '='.repeat(50));

    // Check recent messages
    const messagesResult = await docClient.send(new ScanCommand({
      TableName: 'ChatMessages',
      Limit: 10
    }));

    console.log(`\n📊 Recent Messages: ${messagesResult.Items?.length || 0}\n`);

    if (messagesResult.Items && messagesResult.Items.length > 0) {
      messagesResult.Items
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .forEach((msg, index) => {
          console.log(`\n${index + 1}. Message ID: ${msg.messageId}`);
          console.log(`   Group: ${msg.groupId}`);
          console.log(`   From: ${msg.senderName} (${msg.senderId})`);
          console.log(`   Message: ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}`);
          console.log(`   Time: ${msg.timestamp}`);
        });
    } else {
      console.log('⚠️ No messages found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnections();
