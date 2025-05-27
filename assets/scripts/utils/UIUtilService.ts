import { _decorator, Component, Node, easing, Button, UIOpacity , Vec3, tween,ScrollView, UITransform } from 'cc';
import {NumberTweenTask} from "db://assets/types/NumberTweenTask";


export class UIUtilService{

	private _originalScales = new WeakMap<Node, Vec3>();
	private _numberTweenQueues = new WeakMap<any, NumberTweenTask[]>();
	private _isTweeningMap = new WeakMap<any, boolean>();

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
	public zoomInOut(target: Node, zoomScale = 1.2, duration = 0.1, completeCallback?: () => void) {
		if (!target) return;

		target.active = true;
		const originalScale = target.getScale();

		tween(target)
		.to(duration, {
			scale: new Vec3(
				originalScale.x * zoomScale,
				originalScale.y * zoomScale,
				originalScale.z * zoomScale
			)
		}, { easing: 'quadOut' })
		.to(duration, { scale: originalScale }, { easing: 'quadOut' })
		.call(() => {
			if (completeCallback) completeCallback();
		})
		.start();
	}
	public zoomOutIn(target: Node, zoomScale = 1.2, duration = 0.1, completeCallback?: () => void) {
		if (!target) return;

		target.active = true;
		const originalScale = target.getScale();

		tween(target)
		.to(duration, {
			scale: new Vec3(
				originalScale.x / zoomScale,
				originalScale.y / zoomScale,
				originalScale.z / zoomScale
			)
		}, { easing: 'quadOut' })
		.to(duration, { scale: originalScale }, { easing: 'quadOut' })
		.call(() => {
			target.active = false; // hide after zoom animation
			if (completeCallback) completeCallback();
		})
		.start();
	}



	public _fadeIn(node: Node, duration: number = 0.3, callback?: () => void) {
		const opacity = node.getComponent(UIOpacity);
		node.active = true;

		if (opacity) {
			opacity.opacity = 0;
			tween(opacity)
			.to(duration, { opacity: 255 })
			.call(() => {
				callback?.();
			})
			.start();
		} else {
			callback?.();
		}
	}

	public _fadeOut(node: Node, duration: number = 0.3, callback?: () => void) {
		const opacity = node.getComponent(UIOpacity);
		if (opacity) {
			tween(opacity)
			.to(duration, { opacity: 0 })
			.call(() => {
				node.active = false;
				callback?.();
			})
			.start();
		} else {
			node.active = false;
			callback?.();
		}
	}

	public queueTweenNumber(
		caller: any, // can be a Label, Node, or component
		endValue: number,
		duration: number,
		onUpdate: (value: number) => void,
		onComplete?: () => void
	) {
		let queue = this._numberTweenQueues.get(caller);
		if (!queue) {
			queue = [];
			this._numberTweenQueues.set(caller, queue);
		}

		const isTweening = this._isTweeningMap.get(caller) || false;
		const startValue = queue.length > 0
			? queue[queue.length - 1].endValue
			: 0;

		queue.push({
			startValue,
			endValue,
			duration,
			onUpdate,
			onComplete,
		});

		if (!isTweening) {
			this._startNextTween(caller);
		}
	}

	private _startNextTween(caller: any) {
		const queue = this._numberTweenQueues.get(caller);
		if (!queue || queue.length === 0) {
			this._isTweeningMap.set(caller, false);
			return;
		}

		this._isTweeningMap.set(caller, true);

		const task = queue.shift()!;
		const progressObj = { value: task.startValue };

		tween(progressObj)
		.to(task.duration, { value: task.endValue }, {
			easing: 'quadOut',
			onUpdate: () => task.onUpdate?.(Math.floor(progressObj.value)),
			onComplete: () => {
				task.onUpdate?.(Math.floor(task.endValue));
				task.onComplete?.();
				this._startNextTween(caller);
			}
		})
		.start();
	}

	public clearTweenQueue(caller: any) {
		this._numberTweenQueues.set(caller, []);
		this._isTweeningMap.set(caller, false);
	}

	public formatCurrency(balance: number,options?: { currencyCode?: string;	locale?: string; decimalPlaces?: number}): string {
		const locale = options?.locale ?? 'en-US';
		const decimalPlaces = options?.decimalPlaces ?? 2;

		if (options?.currencyCode) {
			return new Intl.NumberFormat(locale, {
				style: 'currency',
				currency: options.currencyCode,
				minimumFractionDigits: decimalPlaces,
				maximumFractionDigits: decimalPlaces,
			}).format(balance);
		} else {
			return new Intl.NumberFormat(locale, {
				minimumFractionDigits: decimalPlaces,
				maximumFractionDigits: decimalPlaces,
			}).format(balance);
		}
	}



}
export const UIUtil = new UIUtilService();

