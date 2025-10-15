export class ChatApiService {
  private apiEndpoint: string;

  constructor() {
    this.apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || '';
  }

  async createGroup(groupData: any) {
    const response = await fetch(`${this.apiEndpoint}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData)
    });
    return response.json();
  }

  async getGroups(userId: string) {
    const response = await fetch(`${this.apiEndpoint}/groups?userId=${userId}`);
    return response.json();
  }

  async addMember(groupId: string, userId: string, role: string = 'member') {
    const response = await fetch(`${this.apiEndpoint}/groups/${groupId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role })
    });
    return response.json();
  }

  async getMessages(groupId: string, limit: number = 50) {
    const response = await fetch(`${this.apiEndpoint}/groups/${groupId}/messages?limit=${limit}`);
    return response.json();
  }
}

export const chatApiService = new ChatApiService();
