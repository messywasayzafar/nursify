#!/bin/bash

# Package Lambda function
cd lambda
zip -r ../location-proxy.zip .
cd ..

# Deploy CloudFormation stack
aws cloudformation deploy \
  --template-file cloudformation/location-api.yaml \
  --stack-name nursify-location-api \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Update Lambda function code
aws lambda update-function-code \
  --function-name nursify-location-proxy \
  --zip-file fileb://location-proxy.zip \
  --region us-east-1

# Get API endpoint
aws cloudformation describe-stacks \
  --stack-name nursify-location-api \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text \
  --region us-east-1