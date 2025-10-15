const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });

async function checkGSIStatus() {
  try {
    console.log('🔍 Checking GroupIdIndex status on WebSocketConnections table...\n');
    
    const command = new DescribeTableCommand({
      TableName: 'WebSocketConnections'
    });
    
    const response = await client.send(command);
    const gsi = response.Table?.GlobalSecondaryIndexes?.find(
      index => index.IndexName === 'GroupIdIndex'
    );
    
    if (!gsi) {
      console.log('❌ GroupIdIndex NOT FOUND');
      console.log('💡 Run: node add-groupid-index.js');
      return;
    }
    
    console.log('✅ GroupIdIndex found!');
    console.log(`📊 Status: ${gsi.IndexStatus}`);
    console.log(`📈 Item Count: ${gsi.ItemCount || 0}`);
    
    if (gsi.IndexStatus === 'ACTIVE') {
      console.log('\n🎉 Index is ACTIVE and ready to use!');
      console.log('✅ You can now deploy the Lambda function');
    } else if (gsi.IndexStatus === 'CREATING') {
      console.log('\n⏳ Index is still being created...');
      console.log('💡 Please wait a few more minutes and run this script again');
    } else {
      console.log(`\n⚠️ Index status: ${gsi.IndexStatus}`);
      console.log('💡 Check AWS Console for more details');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'ResourceNotFoundException') {
      console.log('💡 WebSocketConnections table not found. Make sure it exists.');
    }
  }
}

checkGSIStatus();
