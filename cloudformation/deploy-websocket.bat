@echo off
echo ========================================
echo Deploying WebSocket API via CloudFormation
echo ========================================
echo.

REM Deploy CloudFormation Stack
echo Deploying CloudFormation stack...
aws cloudformation create-stack ^
  --stack-name nursify-websocket-api ^
  --template-body file://websocket-api.yaml ^
  --capabilities CAPABILITY_NAMED_IAM ^
  --region us-east-1

echo.
echo Stack creation initiated. Waiting for completion...
echo This may take 2-3 minutes...
echo.

REM Wait for stack creation to complete
aws cloudformation wait stack-create-complete ^
  --stack-name nursify-websocket-api ^
  --region us-east-1

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.

REM Get WebSocket URL from stack outputs
echo Retrieving WebSocket URL...
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name nursify-websocket-api --region us-east-1 --query "Stacks[0].Outputs[?OutputKey=='WebSocketURL'].OutputValue" --output text') do set WS_URL=%%i

echo.
echo Your WebSocket URL is:
echo %WS_URL%
echo.
echo Add this to your .env.local file:
echo NEXT_PUBLIC_WS_ENDPOINT=%WS_URL%
echo.
echo ========================================
pause
