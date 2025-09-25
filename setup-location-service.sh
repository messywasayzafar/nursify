#!/bin/bash

echo "Setting up Amazon Location Service..."

# Create Location Service resources
echo "Creating map..."
aws location create-map --map-name nursify-map --configuration Style=VectorEsriStreets

echo "Creating geofence collection..."
aws location create-geofence-collection --collection-name nursify-geofences

echo "Creating tracker..."
aws location create-tracker --tracker-name nursify-tracker

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create IAM policy
echo "Creating IAM policy..."
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

aws iam create-policy --policy-name NursifyLocationServicePolicy --policy-document file://location-policy.json

echo "Setup complete! Resources created:"
echo "- Map: nursify-map"
echo "- Geofence Collection: nursify-geofences" 
echo "- Tracker: nursify-tracker"
echo "- IAM Policy: NursifyLocationServicePolicy"

# Clean up
rm location-policy.json

echo "Next: Attach the policy to your Cognito authenticated role in IAM console"