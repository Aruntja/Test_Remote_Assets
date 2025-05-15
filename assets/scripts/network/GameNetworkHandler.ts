import {GameManager} from "db://assets/scripts/managers/GameManager";
import {ApiService} from "db://assets/scripts/services/ApiService";
import {GameConfig} from "db://assets/scripts/game/config/GameConfigProxy";


export class GameNetworkHandler {

	private initUrl: string = 'init';

	public constructor(
		protected gameManager: GameManager
	) {

	}

	public async requestGameInit(): Promise<any> {
		const url = `${GameConfig.env.baseURL}/api/${GameConfig.gameID}/${this.initUrl}`;
		const data = await this.handleApiCall(
			() => ApiService.instance.post(url, this._buildGameInitRequest()),			'init'
		);
		this.gameManager.initializationComplete = true;
		if (data) {
		}
	}

	private _buildGameInitRequest(): any {
		return {
			gameId: GameConfig.gameID,
			token: GameConfig.playerData.token,
		};
	}


	public async handleApiCall<T>(apiFunc: () => Promise<T>, p0: string): Promise<T | null> {
		// EventBus.emit("SHOW_LOADER");
		try {
			return await apiFunc();
		} catch (err) {
			console.error("[GameNetworkHandler] API call failed:", err);
			// EventBus.emit("API_ERROR", err);
			return null;
		} finally {
			// EventBus.emit("HIDE_LOADER");
		}
	}
}
