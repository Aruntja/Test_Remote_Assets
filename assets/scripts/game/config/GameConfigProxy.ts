import {IEnvironmentVariables} from "db://assets/types/IEnvironmentVariables";

class GameConfigProxy {

	public env?: IEnvironmentVariables;
	public gameID?: string = "monkeyking";
	private _playerData!: any;
	public language: string = "en";

	get playerData(): any {
		return this._playerData;
	}

	set playerData(value: any) {
		this._playerData = value;
	}

	constructor() {
		this.readURLParams()
	}
	public readURLParams(): void {
		this.playerData = {};

		const result: string[] = window.location.href.substring(0).split("#")[0].split("?");

		if (result[1]) {
			const params: string[] = result[1].split("&");
			const len: number = params.length;
			if (len > 0) {
				for (let i = 0; i < len; i++) {
					const values: string[] = params[i].split("=");
					if (values[0].length > 0) {
						this.playerData[values[0]] = typeof values[1] === "undefined" ? "" : values[1];
					}
				}
			}
		}
	}
}
export const GameConfig = new GameConfigProxy();

