# Manual Setup Instructions

## 1. Create IAM Role
```bash
aws iam create-role --role-name nursify-location-lambda-role --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}'

aws iam attach-role-policy --role-name nursify-location-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam put-role-policy --role-name nursify-location-lambda-role --policy-name LocationAccess --policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "geo:GetMapTile",
        "geo:SearchPlaceIndexForText",
        "geo:GetPlace",
        "cognito-identity:GetCredentialsForIdentity",
        "cognito-identity:GetId"
      ],
      "Resource": "*"
    }
  ]
}'
```

## 2. Create Lambda Function
```bash
aws lambda create-function \
  --function-name nursify-location-proxy \
  --runtime nodejs18.x \
  --role arn:aws:iam::511000088730:role/nursify-location-lambda-role \
  --handler location-proxy.handler \
  --zip-file fileb://location-proxy.zip \
  --region us-east-1
```

## 3. Create API Gateway (AWS Console)
1. Go to API Gateway console
2. Create REST API
3. Create resource `/location`
4. Create POST method
5. Set integration to Lambda Proxy
6. Deploy to stage `prod`

## 4. Get API Endpoint
Your endpoint will be: `https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/location`