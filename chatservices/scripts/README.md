# Chat Service Scripts

This folder contains utility scripts for managing and fixing the group chat system.

## Quick Fix Scripts

### 1. fix-group-chat.bat
**Purpose**: Automated deployment of the group chat fix

**Usage**:
```bash
fix-group-chat.bat
```

**What it does**:
1. Adds GroupIdIndex to WebSocketConnections table
2. Waits for confirmation that index is ACTIVE
3. Packages and deploys updated Lambda function
4. Verifies deployment

### 2. add-groupid-index.js
**Purpose**: Adds the missing GroupIdIndex GSI to WebSocketConnections table

**Usage**:
```bash
node add-groupid-index.js
```

**What it does**:
- Checks if GroupIdIndex already exists
- If not, creates the index
- Reports success or error

**Note**: Index creation takes 2-3 minutes. Use `check-gsi-status.js` to monitor progress.

### 3. check-gsi-status.js
**Purpose**: Check if GroupIdIndex is ready

**Usage**:
```bash
node check-gsi-status.js
```

**Output**:
- ✅ Index is ACTIVE - Ready to deploy Lambda
- ⏳ Index is CREATING - Wait and check again
- ❌ Index NOT FOUND - Run add-groupid-index.js

## Diagnostic Scripts

### 4. test-connections.js
**Purpose**: View all active WebSocket connections, group members, and recent messages

**Usage**:
```bash
node test-connections.js
```

**Shows**:
- Active WebSocket connections (who's online)
- Group members (who's in each group)
- Recent messages (last 10 messages)

**Use this to**:
- Verify users are connected
- Check if users are in the same group
- See if messages are being stored

### 5. create-tables.js
**Purpose**: Create all required DynamoDB tables

**Usage**:
```bash
node create-tables.js
```

**Creates**:
- PatientGroups
- GroupMembers
- ChatMessages
- WebSocketConnections (with all required indexes)

## Deployment Workflow

### First Time Setup
```bash
# 1. Create tables
node create-tables.js

# 2. Wait for tables to be ACTIVE (check AWS Console)

# 3. Deploy Lambda functions (see parent README)
```

### Fixing Existing Deployment
```bash
# Option A: Automated (Windows)
fix-group-chat.bat

# Option B: Manual
node add-groupid-index.js
node check-gsi-status.js  # Wait until ACTIVE
# Then deploy Lambda manually
```

### Troubleshooting
```bash
# Check what's happening
node test-connections.js

# Check if fix is ready
node check-gsi-status.js

# View CloudWatch logs
aws logs tail /aws/lambda/sendMessage --follow
```

## Common Issues

### "Index already exists"
✅ This is good! The fix is already applied.

### "Table not found"
❌ Run `create-tables.js` first

### "Index is CREATING"
⏳ Wait 2-3 minutes and run `check-gsi-status.js` again

### "No active connections"
💡 Make sure users are logged in and viewing a chat

### "Users in different groups"
💡 Both users must join the same patient group chat

## Requirements

All scripts require:
- Node.js installed
- AWS SDK packages installed (`npm install` in this folder)
- AWS credentials configured
- Correct AWS region (us-east-1)

## Environment Variables

Scripts use these from your environment or .env.local:
- `AWS_REGION` or `NEXT_PUBLIC_AWS_REGION` (default: us-east-1)
- AWS credentials (from AWS CLI config or environment)

## Support

For detailed troubleshooting, see:
- `../GROUP_CHAT_FIX.md` - Comprehensive fix documentation
- `../HOW_IT_WORKS.md` - System architecture explanation
- `../QUICK_FIX_SUMMARY.md` - Quick reference guide
