Write-Host "========================================"
Write-Host "Deploying WebSocket API via CloudFormation"
Write-Host "========================================"
Write-Host ""

# Deploy CloudFormation Stack
Write-Host "Deploying CloudFormation stack..."
aws cloudformation create-stack `
  --stack-name nursify-websocket-api `
  --template-body file://websocket-api.yaml `
  --capabilities CAPABILITY_NAMED_IAM `
  --region us-east-1

Write-Host ""
Write-Host "Stack creation initiated. Waiting for completion..."
Write-Host "This may take 2-3 minutes..."
Write-Host ""

# Wait for stack creation to complete
aws cloudformation wait stack-create-complete `
  --stack-name nursify-websocket-api `
  --region us-east-1

Write-Host ""
Write-Host "========================================"
Write-Host "Deployment Complete!"
Write-Host "========================================"
Write-Host ""

# Get WebSocket URL from stack outputs
Write-Host "Retrieving WebSocket URL..."
$WS_URL = aws cloudformation describe-stacks `
  --stack-name nursify-websocket-api `
  --region us-east-1 `
  --query "Stacks[0].Outputs[?OutputKey=='WebSocketURL'].OutputValue" `
  --output text

Write-Host ""
Write-Host "Your WebSocket URL is:"
Write-Host $WS_URL
Write-Host ""
Write-Host "Add this to your .env.local file:"
Write-Host "NEXT_PUBLIC_WS_ENDPOINT=$WS_URL"
Write-Host ""
Write-Host "========================================"
Write-Host ""
Read-Host "Press Enter to exit"
