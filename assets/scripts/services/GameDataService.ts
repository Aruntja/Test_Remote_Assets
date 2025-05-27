import {Singleton} from "db://assets/scripts/core/Singleton";

export class GameDataService extends Singleton<GameDataService>{
	private _initData: any = null;

	setInitData(data: any) {
		this._initData = data;
	}

	get initData(): any {
		return this._initData;
	}
}
