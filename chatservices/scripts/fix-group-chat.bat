@echo off
echo ========================================
echo Group Chat Fix Deployment Script
echo ========================================
echo.

echo Step 1: Adding GroupIdIndex to DynamoDB...
node add-groupid-index.js
if %errorlevel% neq 0 (
    echo ERROR: Failed to add GroupIdIndex
    pause
    exit /b 1
)
echo.

echo Step 2: Waiting for index to become active...
echo Please check AWS Console to verify the index is ACTIVE before continuing.
echo Press any key when the index is ACTIVE...
pause > nul
echo.

echo Step 3: Packaging Lambda function...
cd ..\lambda
if exist sendMessage.zip del sendMessage.zip
powershell -Command "Compress-Archive -Path sendMessage.js,package.json -DestinationPath sendMessage.zip -Force"
if %errorlevel% neq 0 (
    echo ERROR: Failed to package Lambda function
    pause
    exit /b 1
)
echo.

echo Step 4: Updating Lambda function...
aws lambda update-function-code --function-name sendMessage --zip-file fileb://sendMessage.zip --region us-east-1
if %errorlevel% neq 0 (
    echo ERROR: Failed to update Lambda function
    echo Make sure AWS CLI is configured and you have the correct permissions
    pause
    exit /b 1
)
echo.

echo ========================================
echo Fix deployed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Test with two different users
echo 2. Check CloudWatch Logs for any errors
echo 3. Verify messages appear for both users
echo.
pause
