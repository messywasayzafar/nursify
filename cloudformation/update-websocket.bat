@echo off
echo ========================================
echo Updating WebSocket API Stack
echo ========================================
echo.

echo Updating CloudFormation stack...
aws cloudformation update-stack ^
  --stack-name nursify-websocket-api ^
  --template-body file://websocket-api.yaml ^
  --capabilities CAPABILITY_NAMED_IAM ^
  --region us-east-1

echo.
echo Stack update initiated. Waiting for completion...
aws cloudformation wait stack-update-complete ^
  --stack-name nursify-websocket-api ^
  --region us-east-1

echo.
echo ========================================
echo Update Complete!
echo ========================================
pause
