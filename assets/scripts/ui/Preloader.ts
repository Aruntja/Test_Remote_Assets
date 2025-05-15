// scripts/ui/LoadingProgress.ts
import { _decorator, Component, Sprite, tween } from 'cc';
import { EventBus } from "db://assets/scripts/core/EventBus";
import { GameEvents } from "db://assets/scripts/events/GameEvents";

const { ccclass, property } = _decorator;

@ccclass('Preloader')
export class Preloader extends Component {
	@property({ type: Sprite })
	public fillSprite: Sprite | null = null;

	private _activeTween: any = null;
	private _currentProgress: number = 0;

	onLoad() {
		if (this.fillSprite) {
			this._currentProgress = this.fillSprite.fillStart;
		}
	}

	start() {
		this._registerEvents();
	}

	onDestroy() {
		this._unregisterEvents();
		this._cleanupTweens();
	}

	public setProgress(targetValue: number) {
		if (!this.fillSprite) return;

		const clampedValue = Math.max(0, Math.min(1, targetValue));

		if (this._activeTween) {
			this._activeTween.stop();
		}

		// Create new tween from current to target value
		this._activeTween = tween({ progress: this._currentProgress })
		.to(0.5, { progress: clampedValue }, {
			easing: 'quadOut',
			onUpdate: (target: { progress: number }) => {
				this.fillSprite!.fillStart = target.progress;
				this._currentProgress = target.progress;
			},
			onComplete: () => {
				this._activeTween = null;
				this._currentProgress = clampedValue;
				this.fillSprite!.fillStart = clampedValue;
			}
		})
		.start();
	}

	private _registerEvents() {
		EventBus.on(GameEvents.ON_LOAD_PROGRESS, this.setProgress, this);
	}

	private _unregisterEvents() {
		EventBus.off(GameEvents.ON_LOAD_PROGRESS, this.setProgress, this);
	}

	private _cleanupTweens() {
		if (this._activeTween) {
			this._activeTween.stop();
			this._activeTween = null;
		}
	}
}