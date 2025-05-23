import {GameManager} from "db://assets/scripts/managers/GameManager";
import {ApiService} from "db://assets/scripts/services/ApiService";
import {GameConfig} from "db://assets/scripts/game/config/GameConfigProxy";
import {EventBus} from "db://assets/scripts/core/EventBus";
import {GameEvents} from "db://assets/scripts/events/GameEvents";
import {SocketService} from "db://assets/scripts/services/SocketService";


export class GameNetworkHandler {

	private initUrl: string = 'init';
	initError: boolean = false;
	public errorDataMap: Record<string, any> = {};

	public constructor(
		protected gameManager: GameManager
	) {
		SocketService.instance.setNetWorkHandler(this);
	}
	//Socket Functionalities
	private async _connectToSocket(): Promise<void> {
		const socketURL = GameConfig.env.socketURL;
		if (!socketURL) {
			console.warn('[GameNetworkHandler] Socket URL is not defined');
			return;
		}

		console.log('[GameNetworkHandler] Connecting to socket...');
		await SocketService.instance.connect(GameConfig.env.socketURL);
	}
	public sendSocketMessage(message: any): void {
		SocketService.instance.send(message);
	}

	public disconnectSocket(): void {
		SocketService.instance.disconnect();
	}

	//API Functionalities
	base64Encode(text: string): string {
		return btoa(unescape(encodeURIComponent(text)));
	}


	public async requestGameInit(): Promise<any> {
		const url = `${GameConfig.env.baseURL}/api/${GameConfig.gameID}/${this.initUrl}`;
		const data = await this.handleApiCall(
			() => ApiService.instance.post(url, this._buildGameInitRequest()),			'init'
		);
		this.gameManager.initializationComplete = true;
		if (data) {
			await this._connectToSocket()
			if(SocketService.instance.connected){
			}
		}
	}

	private _buildGameInitRequest(): any {
		return {
			gameId: GameConfig.gameID,
			token: GameConfig.playerData.token,
		};
		// return {
		// 	gameId: this.base64Encode(GameConfig.gameID),
		// 	token: this.base64Encode(GameConfig.playerData.token),
		// };
	}

	public async handleApiCall<T>(apiFunc: () => Promise<T>, p0: string): Promise<T | null> {
		try {
			return await apiFunc();
		} catch (err: any) {
			const status = err?.status || null;
			const message = err?.message || 'Unknown error';
			const body = typeof err?.body === 'object' && err.body !== null ? err.body : null;

			const errorInfo = { status, message, body };

			this.errorDataMap[p0] = errorInfo;

			if (p0 === 'init') {
				this.initError = true;
				return null;
			} else {
				console.error("[GameNetworkHandler] API call failed:", errorInfo);
				EventBus.emit(GameEvents.ON_API_ERROR, errorInfo);
				return null;
			}
		}
	}

}
