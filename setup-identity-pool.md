# Identity Pool Setup

## Apply Policy to Identity Pool Role

1. Go to IAM Console
2. Find the unauthenticated role for identity pool `us-east-1:8be4f584-2e00-487b-838b-43b9f59d7fb5`
3. Attach the policy from `identity-pool-policy.json`

## Or use AWS CLI:

```bash
# Get the role name for your identity pool
aws cognito-identity get-identity-pool-roles --identity-pool-id us-east-1:9769f353-0a46-4524-996e-9f666207aab7

# Attach the policy to the unauthenticated role
aws iam put-role-policy --role-name YOUR_UNAUTH_ROLE_NAME --policy-name GeoMapsAccess --policy-document file://identity-pool-policy.json
```

The policy allows map tile access from localhost and example.com domains for identity pool us-east-1:9769f353-0a46-4524-996e-9f666207aab7.