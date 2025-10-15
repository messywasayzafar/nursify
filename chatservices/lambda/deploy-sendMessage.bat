@echo off
echo Deploying sendMessage Lambda function...

cd /d %~dp0

echo Zipping sendMessage.js...
powershell Compress-Archive -Path sendMessage.js -DestinationPath sendMessage.zip -Force

echo Updating Lambda function...
aws lambda update-function-code --function-name sendMessage --zip-file fileb://sendMessage.zip --region us-east-1

echo Deployment complete!
pause
