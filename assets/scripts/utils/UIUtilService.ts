import {Singleton} from "db://assets/scripts/core/Singleton";

export class UIUtilService{


	public delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
export const UIUtil = new UIUtilService();

