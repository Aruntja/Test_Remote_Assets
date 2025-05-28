import { GameManager } from "db://assets/scripts/managers/GameManager";
import { ApiService } from "db://assets/scripts/services/ApiService";
import { GameConfig } from "db://assets/scripts/game/config/GameConfigProxy";
import { EventBus } from "db://assets/scripts/core/EventBus";
import { GameEvents } from "db://assets/scripts/events/GameEvents";
import { SocketService } from "db://assets/scripts/services/SocketService";
import { GameDataService } from "db://assets/scripts/services/GameDataService";

export class GameNetworkHandler {
	private initUrl: string = 'init';
	private socketReconnectAttempts: number = 0;
	private maxSocketReconnectAttempts: number = 0;
	public initError: boolean = false;
	public errorDataMap: Record<string, any> = {};

	public constructor(
		protected gameManager: GameManager
	) {
		this.initializeNetworkEventListeners();
	}

	private initializeNetworkEventListeners(): void {
		// Socket Event Listeners
		EventBus.on(GameEvents.SOCKET_DISCONNECTED, this.handleSocketDisconnected.bind(this));
		EventBus.on(GameEvents.SOCKET_ERROR, this.handleSocketError.bind(this));
		EventBus.on(GameEvents.SOCKET_RECONNECTING, this.handleSocketReconnecting.bind(this));
	}

	//#region Socket Management
	public async initializeNetworkConnection(): Promise<void> {
		try {
			await this.requestGameInit();
			await this.initializeSocketConnection();
		} catch (error) {
			if(!this.initError){
				this.errorDataMap['socket'] = error;
			}
			console.error('Network initialization failed:', error);
		}
	}

	private async initializeSocketConnection(): Promise<void> {
		const socketURL = `${GameConfig.env.socketURL}/${GameConfig.gameID}`;

		if (!socketURL) {
			throw new Error('Socket URL is not defined');
		}

		console.log('[GameNetworkHandler] Initializing socket connection...');
		SocketService.instance.initialize(socketURL, {
			auth: {
				token: GameConfig.playerData.token,
				playerId: GameDataService.instance.playerInfo.externalPlayerId,
				gameId: GameConfig.gameID
			},
			reconnectionDelay: 1000,
			reconnectionAttempts: this.maxSocketReconnectAttempts
		});

		await Promise.race([
			new Promise<void>((resolve) => {
				const handler = () => {
					SocketService.instance.off(GameEvents.SOCKET_CONNECTED, handler);
					this.handleSocketConnected();
					resolve();
				};
				SocketService.instance.on(GameEvents.SOCKET_CONNECTED, handler);
			}),
			new Promise<void>((_, reject) =>
				setTimeout(() => reject('Socket connection timeout'), 10000))
		]);
	}

	private handleSocketConnected(): void {
		console.log('Socket connected successfully');
		this.socketReconnectAttempts = 0;
		EventBus.emit(GameEvents.NETWORK_STATUS_CHANGED, true);

		// // Register core socket listeners
		// SocketService.instance.on(GameEvents.PLAYER_DATA_UPDATED, this.handlePlayerUpdate.bind(this));
		// SocketService.instance.on(GameEvents.GAME_STATE_UPDATED, this.handleGameStateUpdate.bind(this));
	}

	private handleSocketDisconnected(): void {
		console.log('Socket disconnected');
		EventBus.emit(GameEvents.NETWORK_STATUS_CHANGED, false);
	}

	private handleSocketError(error: Error): void {
		console.error('Socket error:', error);
		EventBus.emit(GameEvents.SOCKET_ERROR, {
			type: 'socket',
			error: error
		});
	}

	private handleSocketReconnecting(attempt: number): void {
		this.socketReconnectAttempts = attempt;
		console.log(`Reconnection attempt ${attempt}/${this.maxSocketReconnectAttempts}`);

		if (attempt >= this.maxSocketReconnectAttempts) {
			EventBus.emit(GameEvents.NETWORK_RECONNECT_FAILED);
		}
	}
	//#endregion

	//#region API Management
	public async requestGameInit(): Promise<any> {
		const url = `${GameConfig.env?.baseURL}/api/${GameConfig.gameID}/${this.initUrl}`;
		const data = await this.handleApiCall(
			() => ApiService.instance.post(url, this.buildGameInitRequest()),
			'init'
		);

		if (data) {
			this.gameManager.initializationComplete = true;
			GameDataService.instance.setInitData(data);
		}else{
			this.initError = true
		}

	}

	private buildGameInitRequest(): any {
		return {
			gameId: this.base64Encode(GameConfig.gameID),
			token: this.base64Encode(GameConfig.playerData.token),
		};
	}

	public async handleApiCall<T>(apiFunc: () => Promise<T>, endpoint: string): Promise<T | null> {
		try {
			const response = await apiFunc();

			if ((response as any)?.errorCode) {
				throw {
					status: (response as any).errorCode,
					message: (response as any).error,
					body: response
				};
			}

			console.log(`API call successful for ${endpoint}`, response);
			return response;
		} catch (err: any) {
			this.handleApiError(err, endpoint);
			return null;
		}
	}

	private handleApiError(error: any, endpoint: string): void {
		const errorInfo = {
			status: error?.status || error?.body?.errorCode || 500,
			message: error?.message || error?.body?.error || 'Unknown error',
			body: error?.body || null,
			endpoint: endpoint
		};

		console.error(`[API Error] ${endpoint}:`, errorInfo);
		if(endpoint === 'init') {
			this.errorDataMap[endpoint] = errorInfo;
		}

		if (errorInfo.status === 401 || errorInfo.status === 403) {
			EventBus.emit(GameEvents.AUTHENTICATION_FAILED);
		}
	}
	//#endregion

	//#region Common Utilities
	public base64Encode(text: string): string {
		return btoa(unescape(encodeURIComponent(text)));
	}

	public sendSocketMessage(event: string, data?: any): void {
		if (!SocketService.instance.getConnectionStatus()) {
			console.warn('Attempted to send message while disconnected');
			EventBus.emit(GameEvents.QUEUE_SOCKET_MESSAGE, { event, data });
			return;
		}

		SocketService.instance.emit(event, data, (response: any) => {
			if (response.error) {
				console.error('Socket error response:', response.error);
			}
		});
	}

	public getNetworkStatus(): { apiConnected: boolean, socketConnected: boolean } {
		return {
			apiConnected: !this.initError,
			socketConnected: SocketService.instance.getConnectionStatus()
		};
	}
	//#endregion

	//#region Game-Specific Handlers
	private handlePlayerUpdate(data: any): void {
		GameDataService.instance.updatePlayerData(data);
		EventBus.emit(GameEvents.PLAYER_DATA_UPDATED, data);
	}

	private handleGameStateUpdate(data: any): void {
		GameDataService.instance.updateGameState(data);
		EventBus.emit(GameEvents.GAME_STATE_UPDATED, data);
	}
	//#endregion
}