@echo off
echo ========================================
echo WebSocket API Setup Script
echo ========================================
echo.

REM Get AWS Account ID
echo Getting AWS Account ID...
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT_ID=%%i
echo Account ID: %ACCOUNT_ID%
echo.

REM Step 1: Create DynamoDB Table
echo Step 1: Creating WebSocketConnections DynamoDB table...
aws dynamodb create-table ^
  --table-name WebSocketConnections ^
  --attribute-definitions AttributeName=connectionId,AttributeType=S AttributeName=groupId,AttributeType=S ^
  --key-schema AttributeName=connectionId,KeyType=HASH ^
  --global-secondary-indexes "IndexName=GroupIdIndex,KeySchema=[{AttributeName=groupId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" ^
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 ^
  --region us-east-1
echo.

REM Step 2: Create IAM Role
echo Step 2: Creating IAM Role...
aws iam create-role ^
  --role-name WebSocketLambdaRole ^
  --assume-role-policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"lambda.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"}]}"
echo.

REM Step 3: Attach Policies
echo Step 3: Attaching policies to role...
aws iam attach-role-policy --role-name WebSocketLambdaRole --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam attach-role-policy --role-name WebSocketLambdaRole --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
aws iam attach-role-policy --role-name WebSocketLambdaRole --policy-arn arn:aws:iam::aws:policy/AmazonAPIGatewayInvokeFullAccess
echo Waiting 10 seconds for IAM role to propagate...
timeout /t 10 /nobreak
echo.

REM Step 4: Package Lambda Functions
echo Step 4: Packaging Lambda functions...
cd lambda
if exist connect.zip del connect.zip
if exist disconnect.zip del disconnect.zip
if exist sendMessage.zip del sendMessage.zip
powershell Compress-Archive -Path connect.js -DestinationPath connect.zip -Force
powershell Compress-Archive -Path disconnect.js -DestinationPath disconnect.zip -Force
powershell Compress-Archive -Path sendMessage.js -DestinationPath sendMessage.zip -Force
cd ..
echo.

REM Step 5: Create Lambda Functions
echo Step 5: Creating Lambda functions...
aws lambda create-function ^
  --function-name WebSocketConnect ^
  --runtime nodejs18.x ^
  --role arn:aws:iam::%ACCOUNT_ID%:role/WebSocketLambdaRole ^
  --handler connect.handler ^
  --zip-file fileb://lambda/connect.zip ^
  --region us-east-1

aws lambda create-function ^
  --function-name WebSocketDisconnect ^
  --runtime nodejs18.x ^
  --role arn:aws:iam::%ACCOUNT_ID%:role/WebSocketLambdaRole ^
  --handler disconnect.handler ^
  --zip-file fileb://lambda/disconnect.zip ^
  --region us-east-1

aws lambda create-function ^
  --function-name WebSocketSendMessage ^
  --runtime nodejs18.x ^
  --role arn:aws:iam::%ACCOUNT_ID%:role/WebSocketLambdaRole ^
  --handler sendMessage.handler ^
  --zip-file fileb://lambda/sendMessage.zip ^
  --region us-east-1
echo.

REM Step 6: Create WebSocket API
echo Step 6: Creating WebSocket API...
for /f "tokens=*" %%i in ('aws apigatewayv2 create-api --name ChatWebSocketAPI --protocol-type WEBSOCKET --route-selection-expression "$request.body.action" --region us-east-1 --query ApiId --output text') do set API_ID=%%i
echo API ID: %API_ID%
echo.

REM Step 7: Create Integrations
echo Step 7: Creating integrations...
for /f "tokens=*" %%i in ('aws apigatewayv2 create-integration --api-id %API_ID% --integration-type AWS_PROXY --integration-uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:%ACCOUNT_ID%:function:WebSocketConnect/invocations --region us-east-1 --query IntegrationId --output text') do set CONNECT_INT=%%i
for /f "tokens=*" %%i in ('aws apigatewayv2 create-integration --api-id %API_ID% --integration-type AWS_PROXY --integration-uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:%ACCOUNT_ID%:function:WebSocketDisconnect/invocations --region us-east-1 --query IntegrationId --output text') do set DISCONNECT_INT=%%i
for /f "tokens=*" %%i in ('aws apigatewayv2 create-integration --api-id %API_ID% --integration-type AWS_PROXY --integration-uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:%ACCOUNT_ID%:function:WebSocketSendMessage/invocations --region us-east-1 --query IntegrationId --output text') do set SENDMSG_INT=%%i
echo.

REM Step 8: Create Routes
echo Step 8: Creating routes...
aws apigatewayv2 create-route --api-id %API_ID% --route-key $connect --target integrations/%CONNECT_INT% --region us-east-1
aws apigatewayv2 create-route --api-id %API_ID% --route-key $disconnect --target integrations/%DISCONNECT_INT% --region us-east-1
aws apigatewayv2 create-route --api-id %API_ID% --route-key sendMessage --target integrations/%SENDMSG_INT% --region us-east-1
echo.

REM Step 9: Create Deployment and Stage
echo Step 9: Creating deployment and stage...
aws apigatewayv2 create-deployment --api-id %API_ID% --region us-east-1
aws apigatewayv2 create-stage --api-id %API_ID% --stage-name production --region us-east-1
echo.

REM Step 10: Grant Permissions
echo Step 10: Granting API Gateway permissions...
aws lambda add-permission --function-name WebSocketConnect --statement-id apigateway-connect --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:us-east-1:%ACCOUNT_ID%:%API_ID%/*/$connect" --region us-east-1
aws lambda add-permission --function-name WebSocketDisconnect --statement-id apigateway-disconnect --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:us-east-1:%ACCOUNT_ID%:%API_ID%/*/$disconnect" --region us-east-1
aws lambda add-permission --function-name WebSocketSendMessage --statement-id apigateway-sendmessage --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:us-east-1:%ACCOUNT_ID%:%API_ID%/*/sendMessage" --region us-east-1
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your WebSocket URL is:
echo wss://%API_ID%.execute-api.us-east-1.amazonaws.com/production
echo.
echo Add this to your .env.local file:
echo NEXT_PUBLIC_WS_ENDPOINT=wss://%API_ID%.execute-api.us-east-1.amazonaws.com/production
echo.
pause
