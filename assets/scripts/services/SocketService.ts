import { Singleton } from '../core/Singleton';
import { EventBus } from '../core/EventBus';
import * as Socket  from "@ms-mgc/game-core-socket.io-client/dist/socket.io.esm.min.js";

interface QueuedMessage {
	event: string;
	data?: any;
	callback?: (response: any) => void;
}

export class SocketService extends Singleton<SocketService> {
	private socket!: Socket;
	private connectionUrl: string = '';
	private isConnected: boolean = false;
	private messageQueue: QueuedMessage[] = [];
	private authToken: string | null = null;
	private networkQuality: number = 1; // 0-1 scale
	private heartbeatInterval: number = 5000; // 5 seconds
	private latency: number = 0;

	constructor() {
		super();
	}

	public initialize(url: string, options: any = {}): void {
		this.connectionUrl = url;

		const defaultOptions = {
			autoConnect: false,
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			transports: ['websocket'],
			...options
		};

		this.socket = Socket.io(url, defaultOptions);
		this.registerCoreListeners();

		if (!defaultOptions.autoConnect) {
			this.socket.connect();
		}

		this.startConnectionMonitor();
	}

	private registerCoreListeners(): void {
		this.socket.on('connect', () => {
			this.isConnected = true;
			this.flushMessageQueue();
		});

		this.socket.on('disconnect', () => {
			this.isConnected = false;
		});

		this.socket.on('connect_error', (err: Error) => {

		});

		this.socket.on('reconnect_attempt', (attempt: number) => {
		});

		// Network quality monitoring
		this.socket.on('ping', () => {
			this.latency = Date.now() - performance.now();
		});

		this.socket.on('pong', (latency: number) => {
			this.latency = latency;
			this.networkQuality = Math.min(1, Math.max(0, 1 - (latency / 1000)));
		});
	}

	private startConnectionMonitor(): void {
		setInterval(() => {
			if (this.isConnected) {
				this.socket.emit('ping', Date.now());
			}
		}, this.heartbeatInterval);
	}

	public authenticate(token: string): void {
		this.authToken = token;
		this.emit('authenticate', { token });
	}

	public emit(event: string, data?: any, callback?: (response: any) => void): void {
		if (!this.isConnected) {
			this.queueMessage(event, data, callback);
			return;
		}

		EventBus.emit("SHOW_LOADER");
		this.socket.emit(event, data, (response: any) => {
			EventBus.emit("HIDE_LOADER");
			if (callback) callback(response);
		});
	}

	private queueMessage(event: string, data?: any, callback?: (response: any) => void): void {
		this.messageQueue.push({ event, data, callback });
		EventBus.emit("NETWORK_QUEUING_MESSAGES", this.messageQueue.length);
	}

	private flushMessageQueue(): void {
		while (this.messageQueue.length > 0) {
			const msg = this.messageQueue.shift();
			if (msg) {
				this.emit(msg.event, msg.data, msg.callback);
			}
		}
		EventBus.emit("NETWORK_QUEUE_FLUSHED");
	}

	public on(event: string, callback: (data: any) => void): void {
		this.socket.on(event, callback);
	}

	public once(event: string, callback: (data: any) => void): void {
		this.socket.once(event, callback);
	}

	public off(event?: string, callback?: (data: any) => void): void {
		if (event && callback) {
			this.socket.off(event, callback);
		} else if (event) {
			this.socket.off(event);
		} else {
			this.socket.off();
		}
	}

	// Getters
	public getSocketId(): string | null {
		return this.socket?.id || null;
	}

	public getConnectionUrl(): string {
		return this.connectionUrl;
	}

	public getConnectionStatus(): boolean {
		return this.isConnected;
	}

	public getNetworkQuality(): number {
		return this.networkQuality;
	}

	public getLatency(): number {
		return this.latency;
	}

	public getQueuedMessageCount(): number {
		return this.messageQueue.length;
	}

	public disconnect(): void {
		if (this.socket) {
			this.socket.disconnect();
			this.socket.removeAllListeners();
			this.isConnected = false;
			this.messageQueue = [];
		}
	}
}