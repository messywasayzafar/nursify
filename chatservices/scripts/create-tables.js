const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIAXN6P2SCNBTUWYOPL',
    secretAccessKey: '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'
  }
});

const tables = [
  {
    TableName: 'PatientGroups',
    KeySchema: [{ AttributeName: 'groupId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'groupId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'GroupMembers',
    KeySchema: [{ AttributeName: 'memberId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'memberId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'groupId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'GroupIdIndex',
        KeySchema: [{ AttributeName: 'groupId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'ChatMessages',
    KeySchema: [{ AttributeName: 'messageId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'messageId', AttributeType: 'S' },
      { AttributeName: 'groupId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GroupIdIndex',
        KeySchema: [
          { AttributeName: 'groupId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'WebSocketConnections',
    KeySchema: [{ AttributeName: 'connectionId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'connectionId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }
];

async function createTables() {
  for (const table of tables) {
    try {
      await client.send(new CreateTableCommand(table));
      console.log(`✅ Created table: ${table.TableName}`);
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.log(`⚠️  Table already exists: ${table.TableName}`);
      } else {
        console.error(`❌ Error creating ${table.TableName}:`, error.message);
      }
    }
  }
}

createTables();
