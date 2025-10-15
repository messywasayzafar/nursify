import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  homeAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  designation?: string;
  department?: string;
  roles?: string;
  geodata?: string;
  permissions?: string;
  companyName?: string;
  gender?: string;
  birthdate?: string;
}

export interface CreateUserResult {
  userId: string;
  isConfirmed: boolean;
  confirmationDeliveryDetails?: {
    deliveryMedium: string;
    destination: string;
  };
}

export class CognitoUserService {
  async createUser(userData: CreateUserData): Promise<CreateUserResult> {
    try {
      const { email, password, firstName, lastName, phoneNumber, profileImageUrl, homeAddress, city, state, zipCode, designation, department, roles, geodata, permissions, companyName, gender, birthdate } = userData;

      // Combine first and last name for full name
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const formattedName = fullName || firstName.trim();
      
      // Create address object as required by Cognito
      const addressParts = [];
      if (homeAddress) addressParts.push(homeAddress);
      if (city) addressParts.push(city);
      if (state) addressParts.push(state);
      if (zipCode) addressParts.push(zipCode);
      
      const formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Not provided';

      // Prepare user attributes
      console.log('Company name in service:', companyName);
      const userAttributes = {
        email,
        name: formattedName,
        address: formattedAddress,
        ...(phoneNumber && { phone_number: phoneNumber }),
        ...(profileImageUrl && { picture: profileImageUrl }),
        ...(birthdate && { birthdate: birthdate }),
        'custom:city': city || '',
        'custom:state': state || '',
        'custom:zip_code': zipCode || '',
        'custom:designation': designation || '',
        'custom:department': department || '',
        'custom:roles': roles || 'field',
        'custom:geodata': geodata || '',
        'custom:permissions': permissions || '',
        'custom:company_name': companyName || '',
        gender: gender || ''
      };
      console.log('User attributes:', userAttributes);

      // Use AdminCreateUser
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      if (!idToken) throw new Error('No auth token');

      const { CognitoIdentityClient, GetIdCommand, GetCredentialsForIdentityCommand } = await import('@aws-sdk/client-cognito-identity');
      const identityClient = new CognitoIdentityClient({ region: 'us-east-1' });
      const getIdResponse = await identityClient.send(new GetIdCommand({
        IdentityPoolId: 'us-east-1:7f04ba4b-e4cc-4299-b5b8-96a9cbbac471',
        Logins: { 'cognito-idp.us-east-1.amazonaws.com/us-east-1_8C0HCUlTs': idToken }
      }));
      const credsResponse = await identityClient.send(new GetCredentialsForIdentityCommand({
        IdentityId: getIdResponse.IdentityId!,
        Logins: { 'cognito-idp.us-east-1.amazonaws.com/us-east-1_8C0HCUlTs': idToken }
      }));
      const credentials = {
        accessKeyId: credsResponse.Credentials!.AccessKeyId!,
        secretAccessKey: credsResponse.Credentials!.SecretKey!,
        sessionToken: credsResponse.Credentials!.SessionToken!,
      };

      const { CognitoIdentityProviderClient, AdminCreateUserCommand } = await import('@aws-sdk/client-cognito-identity-provider');
      const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-east-1', credentials });
      const result = await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: 'us-east-1_8C0HCUlTs',
        Username: email,
        TemporaryPassword: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'name', Value: formattedName },
          { Name: 'address', Value: formattedAddress },
          ...(phoneNumber ? [{ Name: 'phone_number', Value: phoneNumber }] : []),
          ...(profileImageUrl ? [{ Name: 'picture', Value: profileImageUrl }] : []),
          ...(birthdate ? [{ Name: 'birthdate', Value: birthdate }] : []),
          { Name: 'custom:city', Value: city || '' },
          { Name: 'custom:state', Value: state || '' },
          { Name: 'custom:zip_code', Value: zipCode || '' },
          { Name: 'custom:designation', Value: designation || '' },
          { Name: 'custom:department', Value: department || '' },
          { Name: 'custom:roles', Value: roles || 'field' },
          { Name: 'custom:geodata', Value: geodata || '' },
          { Name: 'custom:permissions', Value: permissions || '' },
          { Name: 'custom:company_name', Value: companyName || '' },
          { Name: 'gender', Value: gender || '' },
        ],
        DesiredDeliveryMediums: ['EMAIL']
      }));

      return {
        userId: result.User?.Username || email,
        isConfirmed: true
      };
    } catch (error) {
      console.error('Error creating Cognito user:', error);
      throw error;
    }
  }

  async confirmUser(email: string, confirmationCode: string): Promise<void> {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode
      });
    } catch (error) {
      console.error('Error confirming user:', error);
      throw error;
    }
  }

  async resendConfirmationCode(email: string): Promise<void> {
    try {
      await resendSignUpCode({
        username: email
      });
    } catch (error) {
      console.error('Error resending confirmation code:', error);
      throw error;
    }
  }
}

export const cognitoUserService = new CognitoUserService();
