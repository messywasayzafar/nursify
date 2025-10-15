import { fetchAuthSession } from 'aws-amplify/auth';

export interface ChatMessage {
  messageId: string;
  groupId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type?: 'text' | 'image' | 'file';
}

export interface WebSocketMessage {
  action: 'sendMessage' | 'joinGroup' | 'leaveGroup';
  groupId: string;
  senderId: string;
  senderName: string;
  message?: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private wsEndpoint: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, (message: ChatMessage) => void> = new Map();
  private connectionHandlers: Map<string, () => void> = new Map();

  constructor() {
    // For now, we'll use a mock WebSocket endpoint since the real one needs API Gateway setup
    this.wsEndpoint = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'wss://echo.websocket.org';
  }

  async connect(): Promise<boolean> {
    try {
      console.log('🔌 Connecting to WebSocket...');
      
      // Get AWS credentials for authentication
      const session = await fetchAuthSession();
      const credentials = session.credentials;
      
      if (!credentials) {
        console.warn('⚠️ No AWS credentials available, using mock WebSocket');
        return this.connectMockWebSocket();
      }

      // Create WebSocket connection with authentication
      const authToken = session.tokens?.idToken?.toString() || '';
      const wsUrl = `${this.wsEndpoint}?token=${authToken}`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyConnectionHandlers();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: ChatMessage = JSON.parse(event.data);
          console.log('📨 Received WebSocket message:', message);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.handleReconnect();
      };

      return true;
    } catch (error) {
      console.error('❌ Error connecting to WebSocket:', error);
      return this.connectMockWebSocket();
    }
  }

  private connectMockWebSocket(): boolean {
    console.log('🔌 Using mock WebSocket for development');
    
    // Create a mock WebSocket that simulates real-time messaging
    this.ws = new WebSocket('wss://echo.websocket.org');
    
    this.ws.onopen = () => {
      console.log('✅ Mock WebSocket connected');
      this.reconnectAttempts = 0;
      this.notifyConnectionHandlers();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: ChatMessage = JSON.parse(event.data);
        console.log('📨 Received mock WebSocket message:', message);
        this.handleMessage(message);
      } catch (error) {
        console.error('❌ Error parsing mock WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ Mock WebSocket error:', error);
    };

    this.ws.onclose = (event) => {
      console.log('🔌 Mock WebSocket disconnected:', event.code, event.reason);
      this.handleReconnect();
    };

    return true;
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  private handleMessage(message: ChatMessage) {
    // Notify all registered handlers for this group
    const handler = this.messageHandlers.get(message.groupId);
    if (handler) {
      handler(message);
    }
  }

  private notifyConnectionHandlers() {
    this.connectionHandlers.forEach(handler => handler());
  }

  sendMessage(groupId: string, senderId: string, senderName: string, message: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, cannot send message');
      return false;
    }

    const messageData: WebSocketMessage = {
      action: 'sendMessage',
      groupId,
      senderId,
      senderName,
      message
    };

    try {
      this.ws.send(JSON.stringify(messageData));
      console.log('📤 Message sent:', messageData);
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return false;
    }
  }

  joinGroup(groupId: string, userId: string, userName: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, cannot join group');
      return false;
    }

    const joinData: WebSocketMessage = {
      action: 'joinGroup',
      groupId,
      senderId: userId,
      senderName: userName
    };

    try {
      this.ws.send(JSON.stringify(joinData));
      console.log('👥 Joined group:', joinData);
      return true;
    } catch (error) {
      console.error('❌ Error joining group:', error);
      return false;
    }
  }

  leaveGroup(groupId: string, userId: string, userName: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, cannot leave group');
      return false;
    }

    const leaveData: WebSocketMessage = {
      action: 'leaveGroup',
      groupId,
      senderId: userId,
      senderName: userName
    };

    try {
      this.ws.send(JSON.stringify(leaveData));
      console.log('👋 Left group:', leaveData);
      return true;
    } catch (error) {
      console.error('❌ Error leaving group:', error);
      return false;
    }
  }

  onMessage(groupId: string, handler: (message: ChatMessage) => void) {
    this.messageHandlers.set(groupId, handler);
  }

  onConnection(handler: () => void) {
    this.connectionHandlers.set('connection', handler);
  }

  removeMessageHandler(groupId: string) {
    this.messageHandlers.delete(groupId);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
    this.connectionHandlers.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
