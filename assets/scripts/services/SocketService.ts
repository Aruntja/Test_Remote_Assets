import {Singleton} from "db://assets/scripts/core/Singleton";
import {GameNetworkHandler} from "db://assets/scripts/network/GameNetworkHandler";

export class SocketService extends Singleton<SocketService> {

	private static _instance: SocketService;
	private socket: WebSocket | null = null;
	private _isConnected: boolean = false;
	private url: string = '';
	private _networkHandler: GameNetworkHandler = null;

	private constructor() {
		super()
	}

	public static get instance(): SocketService {
		if (!this._instance) {
			this._instance = new SocketService();
		}
		return this._instance;
	}

	public async connect(url: string): Promise<void> {
		if (this.socket && this._isConnected) {
			console.warn('[SocketService] Already connected.');
			return;
		}

		this.url = url;

		return new Promise((resolve, reject) => {
			this.socket = new WebSocket(url);

			this.socket.onopen = () => {
				this._isConnected = true;
				console.log('[SocketService] Connected');
				resolve();
			};

			this.socket.onmessage = (event) => {
				const data = this._safeParse(event.data);
				// Optional: Handle or emit parsed message here if needed
			};

			this.socket.onerror = (event) => {
				console.error('[SocketService] Error:', event);
				reject(new Error('WebSocket connection error'));
			};

			this.socket.onclose = (event) => {
				if (!this._isConnected) {
					reject(new Error(`[SocketService] Disconnected before connect: ${event.reason}`));
				} else {
					this._isConnected = false;
					console.warn('[SocketService] Disconnected:', event.reason);
				}
			};
		});
	}

	public send(message: any): void {
		if (this.socket && this._isConnected) {
			this.socket.send(JSON.stringify(message));
		} else {
			console.warn('[SocketService] Cannot send, socket not connected.');
		}
	}

	public disconnect(): void {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
			this._isConnected = false;
		}
	}

	private _safeParse(data: string): any {
		try {
			return JSON.parse(data);
		} catch (e) {
			console.warn('[SocketService] Failed to parse message:', data);
			return data;
		}
	}

	public get connected(): boolean {
		return this._isConnected;
	}

	setNetWorkHandler(networkHandler: GameNetworkHandler) {
		this._networkHandler = networkHandler
	}
}
