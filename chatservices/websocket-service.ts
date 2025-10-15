export class WebSocketService {
  private ws: WebSocket | null = null;
  private wsEndpoint: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageHandlers: ((message: any) => void)[] = [];

  constructor(wsEndpoint: string) {
    this.wsEndpoint = wsEndpoint;
  }

  connect(userId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`${this.wsEndpoint}?userId=${userId}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.messageHandlers.forEach(handler => handler(message));
    };

    this.ws.onerror = (error) => console.error('WebSocket error:', error);

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect(userId);
        }, 2000 * this.reconnectAttempts);
      }
    };
  }

  onMessage(handler: (message: any) => void) {
    this.messageHandlers.push(handler);
  }

  sendMessage(groupId: string, senderId: string, senderName: string, message: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'sendMessage',
        groupId,
        senderId,
        senderName,
        message,
        timestamp: new Date().toISOString()
      }));
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}
