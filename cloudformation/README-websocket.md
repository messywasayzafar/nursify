# WebSocket API Deployment Guide

## Overview
This CloudFormation template deploys a complete WebSocket API infrastructure for real-time chat functionality.

## What Gets Created
- **DynamoDB Table**: `WebSocketConnections` - Stores active WebSocket connections
- **IAM Role**: `WebSocketLambdaRole` - Permissions for Lambda functions
- **Lambda Functions**:
  - `WebSocketConnect` - Handles new connections
  - `WebSocketDisconnect` - Handles disconnections
  - `WebSocketSendMessage` - Broadcasts messages to group members
- **API Gateway**: WebSocket API with routes for connect, disconnect, and sendMessage
- **Stage**: Production stage for the WebSocket API

## Prerequisites
- AWS CLI installed and configured
- AWS account with appropriate permissions
- Existing `ChatMessages` DynamoDB table (created earlier)

## Deployment

### Option 1: Using the Deployment Script (Recommended)

1. Open Command Prompt in the `cloudformation` folder
2. Run:
   ```bash
   deploy-websocket.bat
   ```
3. Wait for completion (2-3 minutes)
4. Copy the WebSocket URL from the output
5. Add to your `.env.local`:
   ```
   NEXT_PUBLIC_WS_ENDPOINT=wss://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/production
   ```

### Option 2: Manual CLI Deployment

```bash
aws cloudformation create-stack ^
  --stack-name nursify-websocket-api ^
  --template-body file://websocket-api.yaml ^
  --capabilities CAPABILITY_NAMED_IAM ^
  --region us-east-1

aws cloudformation wait stack-create-complete ^
  --stack-name nursify-websocket-api ^
  --region us-east-1

aws cloudformation describe-stacks ^
  --stack-name nursify-websocket-api ^
  --region us-east-1 ^
  --query "Stacks[0].Outputs[?OutputKey=='WebSocketURL'].OutputValue" ^
  --output text
```

## Update Stack

If you need to update the stack:
```bash
update-websocket.bat
```

Or manually:
```bash
aws cloudformation update-stack ^
  --stack-name nursify-websocket-api ^
  --template-body file://websocket-api.yaml ^
  --capabilities CAPABILITY_NAMED_IAM ^
  --region us-east-1
```

## Delete Stack

To remove all resources:
```bash
delete-websocket.bat
```

Or manually:
```bash
aws cloudformation delete-stack ^
  --stack-name nursify-websocket-api ^
  --region us-east-1
```

## Verify Deployment

Check stack status:
```bash
aws cloudformation describe-stacks ^
  --stack-name nursify-websocket-api ^
  --region us-east-1
```

List all resources:
```bash
aws cloudformation list-stack-resources ^
  --stack-name nursify-websocket-api ^
  --region us-east-1
```

## Testing

Test WebSocket connection using wscat:
```bash
npm install -g wscat
wscat -c "wss://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/production?userId=testuser&groupId=testgroup"
```

Send a test message:
```json
{"action":"sendMessage","groupId":"testgroup","senderId":"testuser","senderName":"Test User","message":"Hello World"}
```

## Troubleshooting

### Check Lambda Logs
```bash
aws logs tail /aws/lambda/WebSocketConnect --follow
aws logs tail /aws/lambda/WebSocketDisconnect --follow
aws logs tail /aws/lambda/WebSocketSendMessage --follow
```

### Check Stack Events
```bash
aws cloudformation describe-stack-events ^
  --stack-name nursify-websocket-api ^
  --region us-east-1
```

### Common Issues

1. **Stack creation fails**: Check IAM permissions
2. **Lambda errors**: Check CloudWatch logs
3. **Connection fails**: Verify WebSocket URL format
4. **Messages not received**: Check GroupIdIndex on DynamoDB table

## Cost Estimate

- DynamoDB: ~$1-5/month (based on usage)
- Lambda: Free tier covers most usage
- API Gateway: $1 per million messages
- Total: ~$2-10/month for typical usage

## Architecture

```
Client (Browser)
    ↓
WebSocket API Gateway
    ↓
Lambda Functions (Connect/Disconnect/SendMessage)
    ↓
DynamoDB (WebSocketConnections + ChatMessages)
```

## Security Notes

- WebSocket connections require userId and groupId parameters
- Messages are only sent to users in the same group
- Stale connections are automatically cleaned up
- All data is encrypted at rest in DynamoDB
