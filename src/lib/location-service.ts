import { LocationClient, PutGeofenceCommand, BatchUpdateDevicePositionCommand } from '@aws-sdk/client-location';
import { fetchAuthSession } from 'aws-amplify/auth';

export class LocationService {
  private client: LocationClient | null = null;

  private async getClient() {
    if (!this.client) {
      const session = await fetchAuthSession();
      this.client = new LocationClient({
        region: 'us-east-1',
        credentials: session.credentials
      });
    }
    return this.client;
  }

  async createGeofence(geofenceId: string, coordinates: [number, number], radius: number = 1000) {
    const client = await this.getClient();
    
    const command = new PutGeofenceCommand({
      CollectionName: 'nursify-geofences',
      GeofenceId: geofenceId,
      Geometry: {
        Circle: {
          Center: coordinates,
          Radius: radius
        }
      }
    });

    return client.send(command);
  }

  async updateDevicePosition(deviceId: string, coordinates: [number, number]) {
    const client = await this.getClient();
    
    const command = new BatchUpdateDevicePositionCommand({
      TrackerName: 'nursify-tracker',
      Updates: [{
        DeviceId: deviceId,
        Position: coordinates,
        SampleTime: new Date()
      }]
    });

    return client.send(command);
  }
}

export const locationService = new LocationService();