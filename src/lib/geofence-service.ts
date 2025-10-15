import { LocationClient, PutGeofenceCommand, GetGeofenceCommand, ListGeofencesCommand } from '@aws-sdk/client-location';
import { fetchAuthSession } from 'aws-amplify/auth';

export interface GeofenceData {
  id: string;
  center: [number, number];
  radius: number;
  name: string;
  type: 'hospital' | 'custom';
  userId?: string;
  createdAt?: string;
}

export class GeofenceService {
  private client: LocationClient | null = null;

  private async getClient() {
    if (!this.client) {
      const session = await fetchAuthSession();
      if (!session.credentials) {
        throw new Error('No credentials available. Please log in.');
      }
      this.client = new LocationClient({
        region: 'us-east-1',
        credentials: session.credentials
      });
    }
    return this.client;
  }

  async createGeofence(geofenceData: GeofenceData) {
    const client = await this.getClient();
    
    const command = new PutGeofenceCommand({
      CollectionName: 'nursify-geofences',
      GeofenceId: geofenceData.id,
      Geometry: {
        Circle: {
          Center: geofenceData.center,
          Radius: geofenceData.radius
        }
      }
    });

    return client.send(command);
  }

  async getGeofence(geofenceId: string) {
    const client = await this.getClient();
    
    const command = new GetGeofenceCommand({
      CollectionName: 'nursify-geofences',
      GeofenceId: geofenceId
    });

    return client.send(command);
  }

  async listGeofences() {
    const client = await this.getClient();
    
    const command = new ListGeofencesCommand({
      CollectionName: 'nursify-geofences'
    });

    return client.send(command);
  }

  async createUserGeofences(userId: string, geofences: GeofenceData[]) {
    const results = [];
    
    for (const geofence of geofences) {
      try {
        // Add user ID to geofence metadata
        const geofenceWithUser = {
          ...geofence,
          userId,
          createdAt: new Date().toISOString()
        };
        
        const result = await this.createGeofence(geofenceWithUser);
        results.push({ success: true, geofenceId: geofence.id, result });
      } catch (error) {
        console.error(`Failed to create geofence ${geofence.id}:`, error);
        results.push({ success: false, geofenceId: geofence.id, error });
      }
    }
    
    return results;
  }

  // Helper function to find users near a specific location
  async findUsersNearLocation(
    center: [number, number], 
    radius: number, 
    userGeofences: { userId: string, geofences: GeofenceData[] }[]
  ) {
    const nearbyUsers = [];
    
    for (const userData of userGeofences) {
      for (const geofence of userData.geofences) {
        const distance = this.calculateDistance(center, geofence.center);
        if (distance <= radius) {
          nearbyUsers.push({
            userId: userData.userId,
            geofenceId: geofence.id,
            geofenceName: geofence.name,
            distance: distance,
            geofenceCenter: geofence.center
          });
        }
      }
    }
    
    return nearbyUsers;
  }

  // Calculate distance between two coordinates using Haversine formula
  private calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(coord2[1] - coord1[1]);
    const dLon = this.deg2rad(coord2[0] - coord1[0]);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1[1])) * Math.cos(this.deg2rad(coord2[1])) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export const geofenceService = new GeofenceService();













