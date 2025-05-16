import { _decorator, Component, Label, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Timer')
export class Timer extends Component {
	@property({ type: Label })
	timerLabel: Label = null;

	@property({ type: Label })
	infoLabel: Label = null;

	private _duration: number = 0;
	private _elapsed: number = 0;
	private _running: boolean = false;
	private _onComplete: Function = null;

	private _showingInfo = false;

	onLoad() {
		this.setupOpacity(this.timerLabel.node);
		this.setupOpacity(this.infoLabel.node);
	}

	private setupOpacity(node) {
		if (!node.getComponent(UIOpacity)) {
			node.addComponent(UIOpacity);
		}
		node.getComponent(UIOpacity).opacity = 255;
	}

	public startTimer(seconds: number, onComplete?: Function) {
		this._duration = seconds;
		this._elapsed = 0;
		this._running = true;
		this._onComplete = onComplete;
		this._showingInfo = false;
		this.infoLabel.string = '';
		this.fadeIn(this.timerLabel.node);
		this.fadeOut(this.infoLabel.node);
		this.updateLabel();
	}

	update(deltaTime: number) {
		if (!this._running) return;

		this._elapsed += deltaTime;
		const remaining = Math.max(0, Math.ceil(this._duration - this._elapsed));

		// Handle transitions between labels
		if (remaining === 5 && !this._showingInfo) {
			this._showingInfo = true;
			this.showInfo("Hurry up!");
			this.fadeOut(this.timerLabel.node);
		} else if (remaining === 4 && this._showingInfo) {
			this._showingInfo = false;
			this.fadeIn(this.timerLabel.node);
			this.fadeOut(this.infoLabel.node);
		} else if (remaining === 0) {
			this.showInfo("Time's up!");
			this.fadeOut(this.timerLabel.node);
		}

		this.updateLabel(remaining);

		if (remaining <= 0 && this._running) {
			this._running = false;
			this._onComplete?.();
		}
	}

	private updateLabel(time: number) {
		this.timerLabel.string = time.toString();
	}


	private showInfo(message: string) {
		this._showingInfo = true;
		this.infoLabel.string = message;
		this.fadeOut(this.timerLabel.node);
		this.fadeIn(this.infoLabel.node);
	}

	public stop() {
		this._running = false;
	}

	public reset() {
		this._elapsed = 0;
		this._running = false;
		this._showingInfo = false;
		// this.timerLabel.string = '';
		// this.infoLabel.string = '';
		// this.fadeOut(this.infoLabel.node);
		// this.fadeIn(this.timerLabel.node);
	}

	private fadeIn(node) {
		const opacity = node.getComponent(UIOpacity);
		if (!opacity) return;
		tween(opacity).to(0.2, { opacity: 255 }).start();
	}

	private fadeOut(node) {
		const opacity = node.getComponent(UIOpacity);
		if (!opacity) return;
		tween(opacity).to(0.1, { opacity: 0 }).start();
	}
}
