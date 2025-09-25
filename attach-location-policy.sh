#!/bin/bash

USER_POOL_ID="us-east-1_VmlInJF8R"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "Attaching Location Service policy to Cognito roles..."

# Find Cognito authenticated role
AUTH_ROLE=$(aws iam list-roles --query "Roles[?contains(RoleName, 'Cognito') && contains(RoleName, 'Auth')].RoleName" --output text)

if [ -z "$AUTH_ROLE" ]; then
    echo "Cognito authenticated role not found. Please check your Cognito setup."
    exit 1
fi

echo "Found authenticated role: $AUTH_ROLE"

# Create policy document
cat > location-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "geo:GetMap*",
                "geo:SearchPlaceIndex*",
                "geo:GetGeofence",
                "geo:ListGeofences",
                "geo:PutGeofence",
                "geo:BatchUpdateDevicePosition",
                "geo:GetDevicePosition",
                "geo:ListDevicePositions"
            ],
            "Resource": [
                "arn:aws:geo:us-east-1:${ACCOUNT_ID}:map/nursify-map",
                "arn:aws:geo:us-east-1:${ACCOUNT_ID}:geofence-collection/nursify-geofences",
                "arn:aws:geo:us-east-1:${ACCOUNT_ID}:tracker/nursify-tracker"
            ]
        }
    ]
}
EOF

# Create policy
POLICY_ARN=$(aws iam create-policy --policy-name NursifyLocationServicePolicy --policy-document file://location-policy.json --query 'Policy.Arn' --output text 2>/dev/null || aws iam get-policy --policy-arn "arn:aws:iam::${ACCOUNT_ID}:policy/NursifyLocationServicePolicy" --query 'Policy.Arn' --output text)

# Attach policy to role
aws iam attach-role-policy --role-name "$AUTH_ROLE" --policy-arn "$POLICY_ARN"

echo "✅ Policy attached successfully!"
echo "Role: $AUTH_ROLE"
echo "Policy: $POLICY_ARN"

# Clean up
rm location-policy.json

echo "Location Service is now configured for your Cognito users."