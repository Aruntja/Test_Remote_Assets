import { _decorator, Component, Sprite, Label, Enum, tween, Button } from 'cc';
import {BetType} from "db://assets/scripts/enums/BetOptions";
import {BetButtonsService} from "db://assets/scripts/ui/Services/BetButtonsService";




const { ccclass, property } = _decorator;

@ccclass('BetButton')
export class BetButton extends Component {



	@property(Sprite)
	background!: Sprite;

	@property(Sprite)
	icon!: Sprite;

	@property(Label)
	labelRatio!: Label;

	@property(Label)
	labelBetAmount!: Label;

	@property({ type: Enum(BetType) })
	betType: BetType = BetType.BANK;

	_button: Button;

	private _buttonsService: BetButtonsService = null;
	private iconOriginalScale: any;
	private _selected: boolean;
	private _totalBetAmount: number = 0

	private _displayedAmount: number = 0;
	private _tweenQueue: number[] = [];
	private _isTweening: boolean = false;
	private _progressObj = { value: 0 };


	onLoad() {
		this.updateVisuals()
	}
	start(){
		this._button = this.getComponent(Button);
	}
	updateVisuals() {

		let betTypeKey: string = this.betType;
		if (!betTypeKey) {
			console.warn(`Invalid betType: ${this.betType}`);
			return;
		}
		if (typeof this.betType === "number") {
			betTypeKey = BetType[this.betType];
		} else if (typeof this.betType === "string") {
			betTypeKey = this.betType;
		} else {
			betTypeKey = undefined;
		}

		if (!betTypeKey) {
			console.warn(`Invalid betType: ${this.betType}`);
			return;
		}
		const indices = this._buttonsService.resolveBetTypeIndices(betTypeKey);
		if (!indices) {
			console.warn(`Invalid betType format: ${betTypeKey}`);
			return;
		}
		const { iconIndex, backgroundIndex } = indices;

		if (!this.background || !this._buttonsService.backgrounds?.[backgroundIndex]) {
			console.warn(`Missing background for index ${backgroundIndex}`);
		} else {
			this.background.spriteFrame = this._buttonsService.backgrounds[backgroundIndex];
		}

		if (!this.icon || !this._buttonsService.icons?.[iconIndex]) {
			console.warn(`Missing icon for index ${iconIndex}`);
		} else {
			this.icon.spriteFrame = this._buttonsService.icons[iconIndex];
			this.iconOriginalScale = this.icon.node.getScale().clone();
		}
	}

	updateBetOptions(amount: string){
		this.labelRatio.string = amount;
	}

	showBetAmount(amount: number){
		this._totalBetAmount += amount;
		this._tweenQueue.push(this._totalBetAmount);
		this._tryStartNextTween();
	}


	animateClick() {
		if (!this.icon) return;
		const zoomedScale = this.iconOriginalScale.clone().multiplyScalar(1.2); // 20% larger
		tween(this.icon.node)
		.to(0.1, { scale: zoomedScale }, { easing: 'quadOut' }) // Zoom in
		.to(0.1, { scale: this.iconOriginalScale }, { easing: 'quadIn' }) // Zoom out
		.start();
	}

	private _tryStartNextTween() {
		if (this._isTweening || this._tweenQueue.length === 0) return;

		const targetAmount = this._tweenQueue.shift()!;
		this._isTweening = true;

		this._progressObj.value = this._displayedAmount;

		tween(this._progressObj)
		.to(0.2, { value: targetAmount }, {
			easing: 'quadOut',
			onUpdate: () => {
				this.labelBetAmount.string = Math.floor(this._progressObj.value).toString();
			},
			onComplete: () => {
				this._displayedAmount = targetAmount;
				this._isTweening = false;
				this._tryStartNextTween();
			}
		})
		.start();
	}
	setInteractive(flag: boolean) {
		this._button.interactable = flag;
		this.background.grayscale = !flag && this._totalBetAmount <= 0;
	}

	//Getters and Setters
	set buttonsService(value: BetButtonsService) {
		this._buttonsService = value;
	}
	get selected(): boolean {
		return this._selected;
	}

	set selected(value: boolean) {
		this._selected = value;
	}
	get betAmount(): number {
		return this._displayedAmount;
	}

}
