@echo off
echo Setting up Delete Message Lambda Function...

cd lambda

echo Creating deployment package...
tar -a -c -f deleteMessage.zip deleteMessage.js

echo Creating IAM role for Lambda...
aws iam create-role --role-name DeleteMessageLambdaRole --assume-role-policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"lambda.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"}]}" 2>nul

timeout /t 5 /nobreak >nul

echo Attaching policies to role...
aws iam attach-role-policy --role-name DeleteMessageLambdaRole --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

echo Creating inline policy for DynamoDB access...
aws iam put-role-policy --role-name DeleteMessageLambdaRole --policy-name DynamoDBDeleteAccess --policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"dynamodb:DeleteItem\"],\"Resource\":\"arn:aws:dynamodb:us-east-1:511000088730:table/ChatMessages\"}]}"

timeout /t 10 /nobreak >nul

echo Creating Lambda function...
aws lambda create-function --function-name DeleteMessageFunction --runtime nodejs18.x --role arn:aws:iam::511000088730:role/DeleteMessageLambdaRole --handler deleteMessage.handler --zip-file fileb://deleteMessage.zip --region us-east-1

echo Creating API Gateway REST API...
for /f "tokens=*" %%i in ('aws apigateway create-rest-api --name DeleteMessageAPI --region us-east-1 --query "id" --output text') do set API_ID=%%i
echo API ID: %API_ID%

echo Getting root resource ID...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region us-east-1 --query "items[0].id" --output text') do set ROOT_ID=%%i

echo Creating /messages resource...
for /f "tokens=*" %%i in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %ROOT_ID% --path-part messages --region us-east-1 --query "id" --output text') do set MESSAGES_ID=%%i

echo Creating /{messageId} resource...
for /f "tokens=*" %%i in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %MESSAGES_ID% --path-part {messageId} --region us-east-1 --query "id" --output text') do set MESSAGE_ID_RESOURCE=%%i

echo Creating DELETE method...
aws apigateway put-method --rest-api-id %API_ID% --resource-id %MESSAGE_ID_RESOURCE% --http-method DELETE --authorization-type NONE --region us-east-1

echo Creating Lambda integration...
aws apigateway put-integration --rest-api-id %API_ID% --resource-id %MESSAGE_ID_RESOURCE% --http-method DELETE --type AWS_PROXY --integration-http-method POST --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:511000088730:function:DeleteMessageFunction/invocations --region us-east-1

echo Adding Lambda permission...
aws lambda add-permission --function-name DeleteMessageFunction --statement-id apigateway-delete --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:us-east-1:511000088730:%API_ID%/*/*" --region us-east-1

echo Deploying API...
aws apigateway create-deployment --rest-api-id %API_ID% --stage-name prod --region us-east-1

echo.
echo ========================================
echo Setup Complete!
echo API Endpoint: https://%API_ID%.execute-api.us-east-1.amazonaws.com/prod/messages/{messageId}
echo ========================================
echo.
echo Add this to your .env.local file:
echo NEXT_PUBLIC_DELETE_MESSAGE_API=https://%API_ID%.execute-api.us-east-1.amazonaws.com/prod
echo.

cd ..
