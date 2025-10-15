# WebSocket API Setup Guide

## Prerequisites
- AWS CLI installed and configured
- AWS account with appropriate permissions

## Step 1: Create DynamoDB Table for WebSocket Connections

```bash
aws dynamodb create-table ^
  --table-name WebSocketConnections ^
  --attribute-definitions AttributeName=connectionId,AttributeType=S AttributeName=userId,AttributeType=S ^
  --key-schema AttributeName=connectionId,KeyType=HASH ^
  --global-secondary-indexes "IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" ^
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 ^
  --region us-east-1
```

## Step 2: Create IAM Role for Lambda

```bash
aws iam create-role ^
  --role-name WebSocketLambdaRole ^
  --assume-role-policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"lambda.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"}]}"
```

## Step 3: Attach Policies to Role

```bash
aws iam attach-role-policy ^
  --role-name WebSocketLambdaRole ^
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy ^
  --role-name WebSocketLambdaRole ^
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

aws iam attach-role-policy ^
  --role-name WebSocketLambdaRole ^
  --policy-arn arn:aws:iam::aws:policy/AmazonAPIGatewayInvokeFullAccess
```

## Step 4: Create Lambda Functions

See the lambda functions in the `lambda` folder:
- `connect.js` - Handles WebSocket connections
- `disconnect.js` - Handles WebSocket disconnections
- `sendMessage.js` - Handles sending messages

## Step 5: Package and Deploy Lambda Functions

```bash
cd chatservices\lambda
zip connect.zip connect.js
zip disconnect.zip disconnect.js
zip sendMessage.zip sendMessage.js
```

Get your AWS account ID:
```bash
aws sts get-caller-identity --query Account --output text
```

Create Lambda functions (replace YOUR_ACCOUNT_ID with your actual account ID):

```bash
aws lambda create-function ^
  --function-name WebSocketConnect ^
  --runtime nodejs18.x ^
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/WebSocketLambdaRole ^
  --handler connect.handler ^
  --zip-file fileb://connect.zip ^
  --region us-east-1

aws lambda create-function ^
  --function-name WebSocketDisconnect ^
  --runtime nodejs18.x ^
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/WebSocketLambdaRole ^
  --handler disconnect.handler ^
  --zip-file fileb://disconnect.zip ^
  --region us-east-1

aws lambda create-function ^
  --function-name WebSocketSendMessage ^
  --runtime nodejs18.x ^
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/WebSocketLambdaRole ^
  --handler sendMessage.handler ^
  --zip-file fileb://sendMessage.zip ^
  --region us-east-1
```

## Step 6: Create WebSocket API

```bash
aws apigatewayv2 create-api ^
  --name ChatWebSocketAPI ^
  --protocol-type WEBSOCKET ^
  --route-selection-expression "$request.body.action" ^
  --region us-east-1
```

Save the API ID from the output.

## Step 7: Create Integrations

Replace API_ID and YOUR_ACCOUNT_ID:

```bash
aws apigatewayv2 create-integration ^
  --api-id API_ID ^
  --integration-type AWS_PROXY ^
  --integration-uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:WebSocketConnect/invocations ^
  --region us-east-1

aws apigatewayv2 create-integration ^
  --api-id API_ID ^
  --integration-type AWS_PROXY ^
  --integration-uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:WebSocketDisconnect/invocations ^
  --region us-east-1

aws apigatewayv2 create-integration ^
  --api-id API_ID ^
  --integration-type AWS_PROXY ^
  --integration-uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:WebSocketSendMessage/invocations ^
  --region us-east-1
```

Save the integration IDs from the outputs.

## Step 8: Create Routes

Replace API_ID and INTEGRATION_IDs:

```bash
aws apigatewayv2 create-route ^
  --api-id API_ID ^
  --route-key $connect ^
  --target integrations/CONNECT_INTEGRATION_ID ^
  --region us-east-1

aws apigatewayv2 create-route ^
  --api-id API_ID ^
  --route-key $disconnect ^
  --target integrations/DISCONNECT_INTEGRATION_ID ^
  --region us-east-1

aws apigatewayv2 create-route ^
  --api-id API_ID ^
  --route-key sendMessage ^
  --target integrations/SENDMESSAGE_INTEGRATION_ID ^
  --region us-east-1
```

## Step 9: Create Deployment and Stage

```bash
aws apigatewayv2 create-deployment ^
  --api-id API_ID ^
  --region us-east-1

aws apigatewayv2 create-stage ^
  --api-id API_ID ^
  --stage-name production ^
  --region us-east-1
```

## Step 10: Grant API Gateway Permission to Invoke Lambda

```bash
aws lambda add-permission ^
  --function-name WebSocketConnect ^
  --statement-id apigateway-connect ^
  --action lambda:InvokeFunction ^
  --principal apigateway.amazonaws.com ^
  --source-arn "arn:aws:execute-api:us-east-1:YOUR_ACCOUNT_ID:API_ID/*/$connect" ^
  --region us-east-1

aws lambda add-permission ^
  --function-name WebSocketDisconnect ^
  --statement-id apigateway-disconnect ^
  --action lambda:InvokeFunction ^
  --principal apigateway.amazonaws.com ^
  --source-arn "arn:aws:execute-api:us-east-1:YOUR_ACCOUNT_ID:API_ID/*/$disconnect" ^
  --region us-east-1

aws lambda add-permission ^
  --function-name WebSocketSendMessage ^
  --statement-id apigateway-sendmessage ^
  --action lambda:InvokeFunction ^
  --principal apigateway.amazonaws.com ^
  --source-arn "arn:aws:execute-api:us-east-1:YOUR_ACCOUNT_ID:API_ID/*/sendMessage" ^
  --region us-east-1
```

## Step 11: Get WebSocket URL

Your WebSocket URL will be:
```
wss://API_ID.execute-api.us-east-1.amazonaws.com/production
```

Add this to your `.env.local`:
```
NEXT_PUBLIC_WS_ENDPOINT=wss://API_ID.execute-api.us-east-1.amazonaws.com/production
```

## Verification

Test the WebSocket connection:
```bash
wscat -c "wss://API_ID.execute-api.us-east-1.amazonaws.com/production?userId=testuser&groupId=testgroup"
```
