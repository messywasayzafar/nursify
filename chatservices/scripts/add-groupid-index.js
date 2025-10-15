const { DynamoDBClient, UpdateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });

async function addGroupIdIndex() {
  try {
    // First check if the index already exists
    const describeCommand = new DescribeTableCommand({
      TableName: 'WebSocketConnections'
    });
    
    const tableInfo = await client.send(describeCommand);
    const existingIndexes = tableInfo.Table?.GlobalSecondaryIndexes || [];
    
    const hasGroupIdIndex = existingIndexes.some(index => index.IndexName === 'GroupIdIndex');
    
    if (hasGroupIdIndex) {
      console.log('✅ GroupIdIndex already exists on WebSocketConnections table');
      return;
    }

    console.log('Adding GroupIdIndex to WebSocketConnections table...');
    
    const updateCommand = new UpdateTableCommand({
      TableName: 'WebSocketConnections',
      AttributeDefinitions: [
        {
          AttributeName: 'groupId',
          AttributeType: 'S'
        }
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: 'GroupIdIndex',
            KeySchema: [
              {
                AttributeName: 'groupId',
                KeyType: 'HASH'
              }
            ],
            Projection: {
              ProjectionType: 'ALL'
            }
          }
        }
      ]
    });

    await client.send(updateCommand);
    console.log('✅ GroupIdIndex added successfully!');
    console.log('⏳ Index is being created. This may take a few minutes...');
    console.log('💡 You can check the status in the AWS Console or wait for it to become ACTIVE');
    
  } catch (error) {
    console.error('❌ Error adding GroupIdIndex:', error.message);
    if (error.name === 'ResourceInUseException') {
      console.log('⚠️ Table is being updated. Please wait and try again.');
    }
  }
}

addGroupIdIndex();
