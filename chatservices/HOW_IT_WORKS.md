# How Group Chat Works (After Fix)

## Message Flow

```
User 1 (Browser)                    AWS WebSocket API                    Lambda (sendMessage)                DynamoDB
     |                                      |                                    |                                |
     |---(1) Send Message------------------>|                                    |                                |
     |    {groupId, message}                |                                    |                                |
     |                                      |                                    |                                |
     |                                      |---(2) Invoke Lambda--------------->|                                |
     |                                      |                                    |                                |
     |                                      |                                    |---(3) Store Message----------->|
     |                                      |                                    |    ChatMessages table          |
     |                                      |                                    |                                |
     |                                      |                                    |<---(4) Query Connections-------|
     |                                      |                                    |    WHERE groupId = 'group123'  |
     |                                      |                                    |    (Uses GroupIdIndex GSI)     |
     |                                      |                                    |                                |
     |                                      |                                    |    Returns:                    |
     |                                      |                                    |    - User1: conn-abc           |
     |                                      |                                    |    - User2: conn-xyz           |
     |                                      |                                    |                                |
     |<--(5) Broadcast Message--------------|<--(6) Send to conn-abc------------|                                |
     |                                      |                                    |                                |
User 2 (Browser)                            |                                    |                                |
     |<--(7) Broadcast Message--------------|<--(8) Send to conn-xyz------------|                                |
     |                                      |                                    |                                |
```

## Before Fix (Why It Didn't Work)

### Problem: Missing GroupIdIndex

```
WebSocketConnections Table (BEFORE)
┌─────────────────┬──────────┬──────────┐
│ connectionId    │ userId   │ groupId  │
├─────────────────┼──────────┼──────────┤
│ conn-abc        │ user1    │ group123 │
│ conn-xyz        │ user2    │ group123 │
└─────────────────┴──────────┴──────────┘

Indexes:
✅ Primary Key: connectionId
✅ GSI: UserIdIndex (userId)
❌ GSI: GroupIdIndex (groupId) <- MISSING!

Query: "Find all connections WHERE groupId = 'group123'"
Result: ❌ ERROR - Cannot query by groupId (no index)
```

### What Happened:
1. User 1 sends message to group123
2. Lambda tries to find all users in group123
3. Query fails because there's no GroupIdIndex
4. Message only goes to User 1 (sender)
5. User 2 never receives the message ❌

## After Fix (How It Works Now)

### Solution: Added GroupIdIndex

```
WebSocketConnections Table (AFTER)
┌─────────────────┬──────────┬──────────┐
│ connectionId    │ userId   │ groupId  │
├─────────────────┼──────────┼──────────┤
│ conn-abc        │ user1    │ group123 │
│ conn-xyz        │ user2    │ group123 │
└─────────────────┴──────────┴──────────┘

Indexes:
✅ Primary Key: connectionId
✅ GSI: UserIdIndex (userId)
✅ GSI: GroupIdIndex (groupId) <- ADDED!

Query: "Find all connections WHERE groupId = 'group123'"
Result: ✅ SUCCESS - Returns [conn-abc, conn-xyz]
```

### What Happens Now:
1. User 1 sends message to group123
2. Lambda queries GroupIdIndex for group123
3. Finds both connections: conn-abc (User 1) and conn-xyz (User 2)
4. Broadcasts message to both connections
5. Both User 1 and User 2 see the message ✅

## Database Schema

### Tables and Indexes

```
1. WebSocketConnections
   Primary Key: connectionId
   Attributes: userId, groupId, connectedAt
   GSI: UserIdIndex (userId)
   GSI: GroupIdIndex (groupId) <- Critical for broadcasting!

2. ChatMessages
   Primary Key: messageId
   Attributes: groupId, senderId, senderName, message, timestamp
   GSI: GroupIdIndex (groupId + timestamp)

3. GroupMembers
   Primary Key: memberId
   Attributes: groupId, userId, role, addedAt
   GSI: UserIdIndex (userId)
   GSI: GroupIdIndex (groupId)

4. PatientGroups
   Primary Key: groupId
   Attributes: name, createdBy, createdAt, patientData...
```

## Connection Lifecycle

### 1. User Connects
```
Browser -> WebSocket API -> connect.js Lambda
                              |
                              v
                    Store in WebSocketConnections:
                    {
                      connectionId: "conn-abc",
                      userId: "user1",
                      groupId: "group123",
                      connectedAt: "2024-01-15T10:30:00Z"
                    }
```

### 2. User Sends Message
```
Browser -> WebSocket API -> sendMessage.js Lambda
                              |
                              v
                    1. Store in ChatMessages
                    2. Query GroupIdIndex for all connections
                    3. Broadcast to all connections
```

### 3. User Disconnects
```
Browser -> WebSocket API -> disconnect.js Lambda
                              |
                              v
                    Delete from WebSocketConnections
```

## Key Points

1. **GroupIdIndex is Essential**: Without it, the system can't find who to send messages to
2. **Real-time Broadcasting**: Messages are pushed via WebSocket, not pulled
3. **Automatic Cleanup**: Stale connections are removed automatically
4. **No localStorage**: All data is in AWS DynamoDB (as requested)

## Testing Checklist

- [ ] Both users connect (check WebSocketConnections table)
- [ ] Both users in same group (check GroupMembers table)
- [ ] GroupIdIndex is ACTIVE (check DynamoDB console)
- [ ] Message stored (check ChatMessages table)
- [ ] Message broadcast to both users (check browser console)
- [ ] CloudWatch logs show successful delivery
