# Patient Group Chat Services

AWS-based chat infrastructure for patient group management.

## Architecture

- **DynamoDB Tables**: PatientGroups, GroupMembers, ChatMessages, WebSocketConnections
- **Lambda Functions**: createGroup, getGroups, websocketHandler
- **API Gateway**: REST API + WebSocket API
- **Real-time**: WebSocket connections for live messaging

## Setup

1. Deploy CloudFormation stack:
```bash
aws cloudformation create-stack --stack-name patient-chat --template-body file://cloudformation/chat-infrastructure.yaml --capabilities CAPABILITY_IAM
```

2. Deploy Lambda functions:
```bash
cd lambda
npm install
# Deploy each function to AWS Lambda
```

3. Update .env.local with API endpoints

## Tables Schema

### PatientGroups
- groupId (PK)
- type: "patient" | "internal" | "individual"
- patientId
- name
- createdBy
- createdAt
- members (array)

### GroupMembers
- memberId (PK)
- groupId (GSI)
- userId (GSI)
- role
- addedAt

### ChatMessages
- messageId (PK)
- groupId (GSI)
- senderId
- senderName
- message
- timestamp

### WebSocketConnections
- connectionId (PK)
- userId (GSI)
- connectedAt
