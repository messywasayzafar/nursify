import { signUp, confirmSignUp, signIn, signOut, getCurrentUser } from 'aws-amplify/auth';

export const authService = {
  signUp: async (email: string, password: string) => {
    return await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email
        }
      }
    });
  },

  confirmSignUp: async (email: string, code: string) => {
    return await confirmSignUp({
      username: email,
      confirmationCode: code
    });
  },

  signIn: async (email: string, password: string) => {
    return await signIn({
      username: email,
      password
    });
  },

  signOut: async () => {
    return await signOut();
  },

  getCurrentUser: async () => {
    try {
      return await getCurrentUser();
    } catch {
      return null;
    }
  }
};