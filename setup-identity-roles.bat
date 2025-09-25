@echo off
echo Creating IAM roles for Cognito Identity Pool...

REM Create authenticated role
aws iam create-role --role-name Cognito_NursifyAuth_Role --assume-role-policy-document file://identity-pool-auth-role.json

REM Create unauthenticated role  
aws iam create-role --role-name Cognito_NursifyUnauth_Role --assume-role-policy-document file://identity-pool-unauth-role.json

REM Attach permissions to authenticated role
aws iam put-role-policy --role-name Cognito_NursifyAuth_Role --policy-name NursifyAuthPolicy --policy-document file://auth-role-permissions.json

REM Get role ARNs
for /f "tokens=*" %%i in ('aws iam get-role --role-name Cognito_NursifyAuth_Role --query "Role.Arn" --output text') do set AUTH_ROLE_ARN=%%i
for /f "tokens=*" %%i in ('aws iam get-role --role-name Cognito_NursifyUnauth_Role --query "Role.Arn" --output text') do set UNAUTH_ROLE_ARN=%%i

echo.
echo Auth Role ARN: %AUTH_ROLE_ARN%
echo Unauth Role ARN: %UNAUTH_ROLE_ARN%
echo.
echo Now run this command to attach roles to your Identity Pool:
echo aws cognito-identity set-identity-pool-roles --identity-pool-id "us-east-1:f4a2b484-6806-4731-a486-e0e6c3943c97" --roles authenticated="%AUTH_ROLE_ARN%",unauthenticated="%UNAUTH_ROLE_ARN%"