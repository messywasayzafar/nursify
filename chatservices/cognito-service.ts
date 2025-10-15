import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchUserAttributes } from 'aws-amplify/auth';

const client = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
  }
});

const USER_POOL_ID = process.env.NEXT_PUBLIC_USER_POOL_ID || 'us-east-1_8C0HCUlTs';

export const cognitoService = {
  async getCurrentUserCompany() {
    try {
      const attributes = await fetchUserAttributes();
      return attributes['custom:company_name'] || attributes.company_name || null;
    } catch (error) {
      console.error('Error getting user company:', error);
      return null;
    }
  },

  async getUsersByCompany(companyName: string) {
    try {
      if (!companyName || companyName.trim() === '') {
        console.error('Invalid company name provided');
        return [];
      }

      const targetCompany = companyName.trim();
      console.log('🔍 Fetching all users and filtering by company:', targetCompany);
      
      const command = new ListUsersCommand({
        UserPoolId: USER_POOL_ID,
        Limit: 60
      });

      const result = await client.send(command);
      
      const allUsers = (result.Users || []).map(user => {
        const attrs = user.Attributes?.reduce((acc, attr) => {
          acc[attr.Name] = attr.Value;
          return acc;
        }, {} as any) || {};

        return {
          id: user.Username,
          name: attrs.name || attrs.given_name + ' ' + attrs.family_name || 'Unknown',
          email: attrs.email,
          role: attrs['custom:designation'] || 'Staff',
          companyName: attrs['custom:company_name'],
          status: user.UserStatus === 'CONFIRMED' ? 'available' : 'offline',
          attributes: attrs
        };
      });

      // Filter client-side by company name
      const filteredUsers = allUsers.filter(user => 
        user.companyName && user.companyName.trim().toLowerCase() === targetCompany.toLowerCase()
      );

      console.log(`✅ Found ${filteredUsers.length} users for company "${targetCompany}"`);
      return filteredUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
};
