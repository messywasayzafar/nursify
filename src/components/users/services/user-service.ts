import { generateClient } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import { createUser, updateUser } from '../../../graphql/mutations';
import { getUser, listUsers } from '../../../graphql/queries';
import { User } from '../../../../components/api/API';
import awsconfig from '../../../../aws-exports';

// Configure Amplify
Amplify.configure(awsconfig);

const client = generateClient();

export const userService = {
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await client.graphql({
        query: createUser,
        variables: { input: userData }
      });
      return result.data.createUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUser(id: string, userData: Partial<User>) {
    try {
      const result = await client.graphql({
        query: updateUser,
        variables: { input: { id, ...userData } }
      });
      return result.data.updateUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async getUser(id: string) {
    try {
      const result = await client.graphql({
        query: getUser,
        variables: { id }
      });
      return result.data.getUser;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  async getUserByEmail(email: string) {
    try {
      const result = await client.graphql({
        query: listUsers,
        variables: { filter: { email: { eq: email } } }
      });
      return result.data.listUsers.items[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }
};