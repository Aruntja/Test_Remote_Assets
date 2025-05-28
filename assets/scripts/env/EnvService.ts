import { IEnvironmentVariables } from "../../types/IEnvironmentVariables";
import {GameConfig} from "db://assets/scripts/game/config/GameConfigProxy";
import {GameManager} from "db://assets/scripts/managers/GameManager";

export class EnvService {

	public async loadConfig(): Promise<void> {
		const currentHost = window.location.hostname;
		console.log(`[EnvConfig] Detected Host: ${currentHost}`);
		let configs: any[] = [];
		try {
			let remoteUrl = '';
			if(currentHost === 'localhost'  || currentHost === 'games-cc.microslot.co'){
				remoteUrl = 'https://aruntja.github.io/Test_Remote_Assets/envConfig.json'
			}else{
			}
				remoteUrl ='https://games-cc.microslot.co/env/envConfig.json';
			const response = await fetch(remoteUrl);
			configs = await response.json();
			console.log('[EnvConfig] Loaded remote envConfig.json');
		} catch (e) {
			try {
				const response = await fetch('https://aruntja.github.io/Test_Remote_Assets/envConfig.json');
				// @ts-ignore
				configs = await response.json();
				console.warn('[EnvConfig] Loaded fallback config from test-site');
			} catch (fallbackErr) {
				console.error('[EnvConfig] Both remote and local config fetch failed:', fallbackErr);
				return;
			}
		}

		const matched = configs.find(entry => entry.name.includes(currentHost));

		if (!matched) {
			console.error(`[EnvConfig] No config matched for host: ${currentHost}`);
			return;
		}

		// this.config = matched.config as IEnvironmentVariables;
		// console.log('[EnvConfig] Final Config:', this.config);

		GameConfig.env = matched.config as IEnvironmentVariables
	}

}
export const EnvConfigProxy = new EnvService();
