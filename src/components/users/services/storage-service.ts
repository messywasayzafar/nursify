export interface UploadResult {
  key: string;
  url?: string;
}

export class StorageService {
  async uploadImage(file: File, key: string): Promise<UploadResult> {
    try {
      console.log('Uploading image to S3 bucket: medhexa-admin-pictures-2024');
      console.log('File key:', key);
      console.log('File type:', file.type);
      console.log('File size:', file.size);

      // Get AWS credentials from Amplify
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      
      if (!session.credentials) {
        throw new Error('No AWS credentials available');
      }

      // Use AWS SDK S3 client directly to upload to the correct bucket
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const s3Client = new S3Client({
        region: 'us-east-1',
        credentials: session.credentials
      });

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Upload to S3 (without ACL since bucket doesn't support ACLs)
      const uploadCommand = new PutObjectCommand({
        Bucket: 'medhexa-admin-pictures-2024',
        Key: key,
        Body: buffer,
        ContentType: file.type
        // ACL removed - bucket policy handles public access
      });

      await s3Client.send(uploadCommand);

      // Construct the public URL
      const imageUrl = `https://medhexa-admin-pictures-2024.s3.us-east-1.amazonaws.com/${key}`;
      console.log('Image uploaded successfully. URL:', imageUrl);

      return {
        key: key,
        url: imageUrl
      };
    } catch (error: any) {
      console.error('Error uploading image to S3:', error);
      
      // Check if it's a permission error
      if (error.name === 'AccessDenied' || error.Code === 'AccessDenied') {
        console.error('IAM Permission Error: The Cognito Identity Pool role needs s3:PutObject permission on medhexa-admin-pictures-2024 bucket');
        throw new Error('S3 upload permission denied. Please contact administrator to add s3:PutObject permission to the IAM role.');
      }
      
      throw new Error(`Failed to upload image to S3: ${error.message || 'Unknown error'}`);
    }
  }

  async getImageUrl(key: string): Promise<string> {
    try {
      // Return the public URL directly
      return `https://medhexa-admin-pictures-2024.s3.us-east-1.amazonaws.com/${key}`;
    } catch (error) {
      console.error('Error getting image URL from S3:', error);
      throw new Error('Failed to get image URL from S3');
    }
  }

  async deleteImage(key: string): Promise<void> {
    try {
      console.log('Delete functionality would be implemented here with proper S3 delete permissions');
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }
}

export const storageService = new StorageService();
