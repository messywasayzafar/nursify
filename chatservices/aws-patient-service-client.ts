import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
  }
});

const docClient = DynamoDBDocumentClient.from(client);

const GROUPS_TABLE = 'PatientGroups';
const MEMBERS_TABLE = 'GroupMembers';

class AWSPatientService {
  private currentUser: string | null = null;

  async initialize() {
    if (typeof window === 'undefined') return;
    try {
      const { getCurrentUser } = await import('aws-amplify/auth');
      const user = await getCurrentUser();
      this.currentUser = user.username;
      console.log('Initialized with user:', this.currentUser);
    } catch (error) {
      console.error('Error initializing user:', error);
      this.currentUser = null;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async connectWebSocket() {
    this.initialize();
  }

  async getGroupMessages(groupId: string) {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: 'ChatMessages',
        IndexName: 'GroupIdIndex',
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues: { ':groupId': groupId },
        ScanIndexForward: true
      }));

      return result.Items?.map(item => ({
        id: item.messageId,
        senderId: item.senderId,
        senderName: item.senderName,
        content: item.message,
        timestamp: item.timestamp,
        fileUrl: item.fileUrl,
        fileName: item.fileName
      })) || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async sendMessage(groupId: string, message: string) {
    return { success: true };
  }

  async deleteMessage(groupId: string, messageId: string) {
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, DeleteCommand } = await import('@aws-sdk/lib-dynamodb');
      const { fetchAuthSession } = await import('aws-amplify/auth');
      
      const session = await fetchAuthSession();
      const client = new DynamoDBClient({
        region: 'us-east-1',
        credentials: session.credentials
      });
      const docClient = DynamoDBDocumentClient.from(client);
      
      await docClient.send(new DeleteCommand({
        TableName: 'ChatMessages',
        Key: { messageId }
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getPatientGroups() {
    await this.initialize();
    if (!this.currentUser) {
      console.log('No current user, returning empty groups');
      return [];
    }
    console.log('Fetching groups for user:', this.currentUser);
    const result = await this.getGroupsByUser(this.currentUser);
    console.log('Groups result:', result);
    return result.success ? result.groups : [];
  }

  async addMemberToGroup(groupId: string, userId: string, role: string) {
    try {
      const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await docClient.send(new PutCommand({
        TableName: MEMBERS_TABLE,
        Item: {
          memberId,
          groupId,
          userId,
          role,
          addedAt: now
        }
      }));

      return { success: true, data: { memberId, groupId, userId, role, addedAt: now } };
    } catch (error) {
      console.error('Error adding member:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createPatientGroup(groupData: any) {
    try {
      await this.initialize();
      const creatorUserId = this.currentUser || groupData.createdBy || 'system';
      
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      console.log('Creating group with creatorUserId:', creatorUserId);
      
      const group = {
        groupId,
        type: 'patient',
        patientId: groupData.patientId || `patient_${Date.now()}`,
        name: groupData.name,
        createdBy: creatorUserId,
        createdAt: now,
        dateOfBirth: groupData.dateOfBirth,
        insurance: groupData.insurance,
        contactNumber: groupData.contactNumber,
        homeAddress: groupData.homeAddress,
        city: groupData.city,
        state: groupData.state,
        zipCode: groupData.zipCode,
        primaryPhysicianName: groupData.primaryPhysicianName,
        lastFaceToFaceDate: groupData.lastFaceToFaceDate,
        physicianContact: groupData.physicianContact,
        hhOrderDate: groupData.hhOrderDate,
        socProvider: groupData.socProvider,
        referralSource: groupData.referralSource,
        patientTag: groupData.patientTag,
        about: groupData.about,
        latitude: groupData.latitude,
        longitude: groupData.longitude
      };

      await docClient.send(new PutCommand({
        TableName: GROUPS_TABLE,
        Item: group
      }));

      const memberItem = {
        memberId: `member_${Date.now()}`,
        groupId,
        userId: creatorUserId,
        role: 'creator',
        addedAt: now
      };
      
      console.log('Adding creator as member:', memberItem);
      
      await docClient.send(new PutCommand({
        TableName: MEMBERS_TABLE,
        Item: memberItem
      }));

      console.log('Group created successfully:', groupId);
      console.log('📍 Coordinates saved:', { latitude: groupData.latitude, longitude: groupData.longitude });
      return { success: true, groupId, data: group };
    } catch (error) {
      console.error('Error creating patient group:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getGroupsByUser(userId: string) {
    try {
      console.log('Fetching groups for userId:', userId);
      let memberResult;
      try {
        memberResult = await docClient.send(new QueryCommand({
          TableName: MEMBERS_TABLE,
          IndexName: 'UserIdIndex',
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: { ':userId': userId }
        }));
        console.log('Query succeeded, found members:', memberResult.Items?.length);
      } catch (queryError: any) {
        console.error('Query failed with error:', queryError.message);
        console.log('Falling back to scan');
        const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
        memberResult = await docClient.send(new ScanCommand({
          TableName: MEMBERS_TABLE,
          FilterExpression: 'userId = :userId',
          ExpressionAttributeValues: { ':userId': userId }
        }));
        console.log('Scan succeeded, found members:', memberResult.Items?.length);
      }

      const groupIds = [...new Set(memberResult.Items?.map(item => item.groupId).filter(id => id) || [])];
      console.log('Found groupIds:', groupIds);
      const groups = [];

      for (const groupId of groupIds) {
        if (!groupId) continue;
        try {
          console.log('Fetching group:', groupId);
          const groupResult = await docClient.send(new GetCommand({
            TableName: GROUPS_TABLE,
            Key: { groupId }
          }));
          if (groupResult.Item) {
            console.log('Group found:', groupId);
            groups.push(groupResult.Item);
          }
        } catch (err: any) {
          console.error(`Error fetching group ${groupId}:`, err.message);
        }
      }

      console.log('Total groups fetched:', groups.length);
      return { success: true, groups };
    } catch (error: any) {
      console.error('Error in getGroupsByUser:', error.message, error);
      return { success: false, groups: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deletePatientGroup(groupId: string) {
    try {
      const { DeleteCommand } = await import('@aws-sdk/lib-dynamodb');
      await docClient.send(new DeleteCommand({
        TableName: GROUPS_TABLE,
        Key: { groupId }
      }));
      return { success: true };
    } catch (error) {
      console.error('Error deleting group:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getGroupMembers(groupId: string) {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: MEMBERS_TABLE,
        IndexName: 'GroupIdIndex',
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues: { ':groupId': groupId }
      }));

      const { CognitoIdentityProviderClient, AdminGetUserCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      const { fetchAuthSession } = await import('aws-amplify/auth');
      
      const session = await fetchAuthSession();
      const cognitoClient = new CognitoIdentityProviderClient({
        region: 'us-east-1',
        credentials: session.credentials
      });

      const members = await Promise.all(result.Items?.map(async item => {
        try {
          const userCommand = new AdminGetUserCommand({
            UserPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || 'us-east-1_8C0HCUlTs',
            Username: item.userId
          });
          const userResult = await cognitoClient.send(userCommand);
          const attrs = userResult.UserAttributes || [];
          const nameAttr = attrs.find(attr => attr.Name === 'name');
          const givenNameAttr = attrs.find(attr => attr.Name === 'given_name');
          const familyNameAttr = attrs.find(attr => attr.Name === 'family_name');
          
          const userName = nameAttr?.Value || 
                          (givenNameAttr?.Value && familyNameAttr?.Value 
                            ? `${givenNameAttr.Value} ${familyNameAttr.Value}` 
                            : item.userId);
          
          return {
            id: item.memberId,
            userId: item.userId,
            name: userName,
            role: item.role,
            joinedAt: item.addedAt
          };
        } catch (error) {
          console.error(`Error fetching user ${item.userId}:`, error);
          return {
            id: item.memberId,
            userId: item.userId,
            name: item.userId,
            role: item.role,
            joinedAt: item.addedAt
          };
        }
      }) || []);


      return { success: true, members };
    } catch (error) {
      console.error('Error fetching group members:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const awsPatientService = new AWSPatientService();
