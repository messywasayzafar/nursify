export interface PatientGroupData {
  patientName: string;
  patientId?: string;
  dateOfBirth: string;
  insurance: string;
  contactNumber: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  members: string[];
  createdBy: string;
}

export class AWSPatientGroupService {
  private apiEndpoint: string;
  private wsEndpoint: string;
  private ws: WebSocket | null = null;

  constructor() {
    this.apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || '';
    this.wsEndpoint = process.env.NEXT_PUBLIC_WS_ENDPOINT || '';
  }

  async createPatientGroup(data: PatientGroupData) {
    const response = await fetch(`${this.apiEndpoint}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getPatientGroups(userId: string) {
    const response = await fetch(`${this.apiEndpoint}/groups?userId=${userId}`, {
      method: 'GET'
    });
    return response.json();
  }

  async updatePatientGroup(groupId: string, data: any) {
    const response = await fetch(`${this.apiEndpoint}/groups/${groupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  connectWebSocket(onMessage: (message: any) => void) {
    this.ws = new WebSocket(this.wsEndpoint);
    
    this.ws.onopen = () => console.log('WebSocket connected');
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      onMessage(message);
    };
    this.ws.onerror = (error) => console.error('WebSocket error:', error);
    this.ws.onclose = () => console.log('WebSocket disconnected');
  }

  sendMessage(groupId: string, senderId: string, senderName: string, message: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'sendMessage',
        groupId,
        senderId,
        senderName,
        message
      }));
    }
  }

  disconnect() {
    this.ws?.close();
  }
}

export const awsPatientGroupService = new AWSPatientGroupService();
