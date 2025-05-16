import { _decorator, Component, Node, easing, Button, instantiate, Vec3, tween,ScrollView, UITransform } from 'cc';

export class UIUtilService{

	private _originalScales = new WeakMap<Node, Vec3>();

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
	public zoomInOut(target: Node, zoomScale = 1.2, duration = 0.1) {
		if (!target) return;

		const originalScale = target.getScale();

		tween(target)
		.to(duration, { scale: new Vec3(originalScale.x * zoomScale, originalScale.y * zoomScale, originalScale.z * zoomScale) }, { easing: 'quadOut' })
		.to(duration, { scale: originalScale }, { easing: easing.quadOut })
		.start();
	}

}
export const UIUtil = new UIUtilService();

