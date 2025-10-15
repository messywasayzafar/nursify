import { NextApiRequest, NextApiResponse } from 'next';
import { LocationClient, PutGeofenceCommand } from '@aws-sdk/client-location';

const locationClient = new LocationClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { geofenceId, center, radius } = req.body;

    const command = new PutGeofenceCommand({
      CollectionName: 'nursify-geofences',
      GeofenceId: geofenceId,
      Geometry: {
        Circle: {
          Center: center,
          Radius: radius
        }
      }
    });

    await locationClient.send(command);

    res.status(200).json({ success: true, geofenceId });
  } catch (error) {
    console.error('Error creating geofence:', error);
    res.status(500).json({ error: 'Failed to create geofence' });
  }
}