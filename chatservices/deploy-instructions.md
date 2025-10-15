# Deployment Instructions

## Step 1: Create DynamoDB Tables

```bash
aws cloudformation create-stack \
  --stack-name patient-chat-infrastructure \
  --template-body file://cloudformation/chat-infrastructure.yaml \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

## Step 2: Deploy Lambda Functions

### Install dependencies
```bash
cd lambda
npm install
```

### Create deployment packages
```bash
zip -r createGroup.zip createGroup.js node_modules/
zip -r getGroups.zip getGroups.js node_modules/
zip -r websocketHandler.zip websocketHandler.js node_modules/
```

### Deploy to AWS Lambda
```bash
aws lambda create-function \
  --function-name createPatientGroup \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/LambdaExecutionRole \
  --handler createGroup.handler \
  --zip-file fileb://createGroup.zip \
  --environment Variables={GROUPS_TABLE=PatientGroups,MEMBERS_TABLE=GroupMembers}

aws lambda create-function \
  --function-name getPatientGroups \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/LambdaExecutionRole \
  --handler getGroups.handler \
  --zip-file fileb://getGroups.zip \
  --environment Variables={GROUPS_TABLE=PatientGroups,MEMBERS_TABLE=GroupMembers}

aws lambda create-function \
  --function-name chatWebSocketHandler \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/LambdaExecutionRole \
  --handler websocketHandler.handler \
  --zip-file fileb://websocketHandler.zip \
  --environment Variables={GROUPS_TABLE=PatientGroups,MEMBERS_TABLE=GroupMembers,MESSAGES_TABLE=ChatMessages,CONNECTIONS_TABLE=WebSocketConnections}
```

## Step 3: Configure API Gateway

### REST API
1. Create REST API in AWS Console
2. Create resources: /groups, /groups/{groupId}/members, /groups/{groupId}/messages
3. Link Lambda functions
4. Deploy to production stage

### WebSocket API
1. Create WebSocket API in AWS Console
2. Add routes: $connect, $disconnect, sendMessage
3. Link websocketHandler Lambda
4. Deploy to production stage

## Step 4: Update Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_API_ENDPOINT=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/production
NEXT_PUBLIC_WS_ENDPOINT=wss://YOUR_WS_API_ID.execute-api.us-east-1.amazonaws.com/production
```

## Verification

Test the setup:
```bash
# Test create group
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/production/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Group","type":"patient","createdBy":"user123"}'

# Test get groups
curl https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/production/groups?userId=user123
```
