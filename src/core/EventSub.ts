import type { EventSubMessage, EventSubNotification } from "../types/EventSub";
import type { Subscription } from "../types/Subscriptions";

export default class EventSub {
    private ws: WebSocket | null = null;
    private reconnectURL: string | null = null;
    private keepaliveTimeout: ReturnType<typeof setTimeout> | null = null;
    private reconnectAttempts = 0;
    private isIntentionalClose = false;
    private tempFn: CallableFunction | null = null;

    private sessionId: string | null = null;
    private messageHandler: Map<Subscription['type'], (notification: EventSubNotification) => void> = new Map();

    constructor() { }

    public getSessionId(): string | null {
        return this.sessionId;
    }

    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    public connect(): Promise<string> {
        const url = this.reconnectURL ?? 'wss://eventsub.wss.twitch.tv/ws';

        return new Promise((resolve, reject) => {
            try {

                this.tempFn = (sessionId: string) => {
                    resolve(sessionId);
                }

                this.ws = new WebSocket(url);

                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                }

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                }

                this.ws.onclose = (event) => {
                    console.warn(`WebSocket closed: code=${event.code} reason=${event.reason}`);

                    if (this.keepaliveTimeout) {
                        clearTimeout(this.keepaliveTimeout);
                        this.keepaliveTimeout = null;
                    }

                    if (!this.isIntentionalClose && this.reconnectAttempts < 5) {
                        this.reconnectAttempts++;
                        console.log(`Attempting to reconnect (${this.reconnectAttempts}/5)...`);
                        setTimeout(() => this.connect(), 5000 * this.reconnectAttempts);
                    }
                }
            }

            catch (error) {
                console.error('Failed to create EventSub WebSocket', error);
                reject(error);
            }
        });
    }

    private handleMessage(message: string): void {
        const data: EventSubMessage = JSON.parse(message);

        switch (data.metadata.message_type) {
            case 'session_welcome':
                if (data.payload.session) {
                    this.sessionId = data.payload.session.id;
                    this.reconnectURL = data.payload.session.reconnect_url ?? null;

                    const keepAliveTimeoutSeconds = data.payload.session.keepalive_timeout_seconds ?? 10;
                    this.resetKeepalive(keepAliveTimeoutSeconds);

                    this.reconnectAttempts = 0;

                    if (this.tempFn) {
                        this.tempFn(this.sessionId);
                        this.tempFn = null;
                    }
                }

                break;

            case 'session_keepalive':
                this.resetKeepalive(10);
                break;

            case 'session_reconnect':
                if (data.payload.session?.reconnect_url) {
                    console.log('🔄 Reconnecting to new session...');
                    this.reconnectURL = data.payload.session.reconnect_url;
                    this.connect();
                }

                break;

            case 'revocation':
                console.warn('⚠️ Subscription revoked:', data.payload.subscription?.type);
                break;

            case 'notification':
                if (data.payload.subscription && data.payload.event) {
                    const handler = this.messageHandler.get(data.payload.subscription.type);

                    if (handler)
                        handler({
                            event: data.payload.event,
                            subscription: data.payload.subscription,
                            metadata: data.metadata
                        });

                    this.resetKeepalive(10);
                }

                break;

            default:
                console.warn('Received unknown message type:', data.metadata.message_type);

        }
    }

    private resetKeepalive(timeoutSeconds: number): void {
        if (this.keepaliveTimeout) {
            clearTimeout(this.keepaliveTimeout);
            this.keepaliveTimeout = null;
        }

        const timeoutMs = (timeoutSeconds + 10) * 1000;

        this.keepaliveTimeout = setTimeout(() => {
            console.warn('⚠️ Keepalive timeout - connection may be stale');

            this.close();

            if (!this.isIntentionalClose) {
                this.connect();
            }

        }, timeoutMs);
    }

    public close(): void {
        this.isIntentionalClose = true;

        if (this.keepaliveTimeout) {
            clearTimeout(this.keepaliveTimeout);
            this.keepaliveTimeout = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    public on<T extends Subscription['type']>(event: T, handler: (notification: EventSubNotification<T>) => void): void {
        this.messageHandler.set(event, handler as unknown as (notification: EventSubNotification) => void);
    }

    public off(event: Subscription['type']): void {
        this.messageHandler.delete(event);
    }
}