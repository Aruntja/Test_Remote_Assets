import {Singleton} from "db://assets/scripts/core/Singleton";

export class UIUtilService{


	public delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	public getRandomItem<T>(array: T[]): T {
		if (!array || array.length === 0) {
			throw new Error('Array is empty or undefined.');
		}
		const index = Math.floor(Math.random() * array.length);
		return array[index];
	}

}
export const UIUtil = new UIUtilService();

