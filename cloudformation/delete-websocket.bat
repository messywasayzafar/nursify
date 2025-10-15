@echo off
echo ========================================
echo Deleting WebSocket API Stack
echo ========================================
echo.

echo WARNING: This will delete all WebSocket resources!
echo Press Ctrl+C to cancel or
pause

echo.
echo Deleting CloudFormation stack...
aws cloudformation delete-stack ^
  --stack-name nursify-websocket-api ^
  --region us-east-1

echo.
echo Stack deletion initiated. Waiting for completion...
aws cloudformation wait stack-delete-complete ^
  --stack-name nursify-websocket-api ^
  --region us-east-1

echo.
echo ========================================
echo Stack Deleted Successfully!
echo ========================================
pause
