# AWS Setup Guide for Map Integration

## Step 1: Create Cognito Identity Pool

1. **Go to AWS Cognito Console**
   - Navigate to https://console.aws.amazon.com/cognito/
   - Select "Identity pools" from the left menu
   - Click "Create identity pool"

2. **Configure Identity Pool**
   - Identity pool name: `nursify-identity-pool`
   - Enable "Enable access to unauthenticated identities"
   - Under Authentication providers, select "Cognito"
   - User pool ID: `us-east-1_VmlInJF8R`
   - App client ID: `3adao4tstk8bdlhe9hfcvp2je0`
   - Click "Create pool"

3. **Note the Identity Pool ID**
   - Copy the generated Identity Pool ID (format: `us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## Step 2: Create Amazon Location Service Resources

1. **Create Map Resource**
   ```bash
   aws location create-map \
     --map-name nursify-map \
     --configuration Style=VectorEsriStreets \
     --region us-east-1
   ```

2. **Create Place Index (for geocoding)**
   ```bash
   aws location create-place-index \
     --index-name nursify-places \
     --data-source Esri \
     --region us-east-1
   ```

## Step 3: Configure IAM Roles for Identity Pool

1. **Get Identity Pool Roles**
   ```bash
   aws cognito-identity get-identity-pool-roles \
     --identity-pool-id YOUR_IDENTITY_POOL_ID \
     --region us-east-1
   ```

2. **Create Policy for Location Services**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "geo:GetMapTile",
           "geo:GetMapSprites",
           "geo:GetMapGlyphs",
           "geo:GetMapStyleDescriptor",
           "geo:SearchPlaceIndexForText",
           "geo:SearchPlaceIndexForPosition"
         ],
         "Resource": [
           "arn:aws:geo:us-east-1:*:map/nursify-map",
           "arn:aws:geo:us-east-1:*:place-index/nursify-places"
         ]
       }
     ]
   }
   ```

3. **Attach Policy to Unauthenticated Role**
   ```bash
   aws iam put-role-policy \
     --role-name YOUR_UNAUTH_ROLE_NAME \
     --policy-name LocationServiceAccess \
     --policy-document file://location-policy.json
   ```

## Step 4: Update Configuration Files

1. **Update `client-providers.tsx`**
   ```typescript
   Amplify.configure({
     Auth: {
       Cognito: {
         userPoolId: "us-east-1_VmlInJF8R",
         userPoolClientId: "3adao4tstk8bdlhe9hfcvp2je0",
         identityPoolId: "YOUR_NEW_IDENTITY_POOL_ID",
         region: "us-east-1",
         allowGuestAccess: true
       }
     }
   });
   ```

2. **Update `amplifyconfiguration.json`**
   ```json
   {
     "aws_cognito_identity_pool_id": "YOUR_NEW_IDENTITY_POOL_ID"
   }
   ```

## Step 5: Create AWS Location Map Component

Once the AWS resources are set up, replace the OpenStreetMap component with:

```typescript
import { Geo } from '@aws-amplify/geo';
import { fetchAuthSession } from 'aws-amplify/auth';

const AWSLocationMapPicker = ({ onAddressSelect }) => {
  // Implementation using AWS Location Service
  // This will work after completing steps 1-4
};
```

## Current Status

✅ **Working Now**: OpenStreetMap-based component (no AWS setup required)
⏳ **Next**: Complete AWS setup above for full Location Service integration

The current map component uses OpenStreetMap and works immediately without AWS setup.