# Cognito Setup Instructions

The authentication is configured but you need to get the actual Cognito User Pool details from AWS Console.

## Steps to complete setup:

1. **Go to AWS Console > Cognito**
2. **Find your User Pool** (should be named something like `medhexa31f470cf`)
3. **Get User Pool ID** from the General settings
4. **Get App Client ID** from App integration > App clients

## Update the configuration:

Replace the placeholder values in `src/lib/auth.ts`:

```typescript
userPoolId: 'your-actual-user-pool-id',
userPoolClientId: 'your-actual-client-id',
```

## Test the authentication:

1. Navigate to `/register`
2. Create an account with email/password
3. Check email for verification code
4. Complete verification
5. Login at `/login`

The network error will be resolved once you update with the actual Cognito values.