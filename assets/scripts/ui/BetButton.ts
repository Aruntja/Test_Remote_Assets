import { _decorator, Component, Sprite, Label, Enum, tween, Vec3 } from 'cc';
import {BetType, BetCharacters} from "db://assets/scripts/enums/BetOptions";
import {BetButtonsService} from "db://assets/scripts/ui/Services/BetButtonsService";
import {UIUtil} from "db://assets/scripts/utils/UIUtilService";



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
	betType: BetType = BetType.BANKER;

	@property({ type: Enum(BetCharacters) })
	betCharacter: BetCharacters = BetCharacters.WUKONG;

	private _buttonsService: BetButtonsService = null;
	private iconOriginalScale: any;
	private _selected: boolean;
	private _totalBetAmount: number = 0



	onLoad() {
		this.updateBackground();
		this.updateIcon();
	}

	updateBackground() {
		if (!this.background || !this._buttonsService.backgrounds[this.betType]) {
			console.warn('Missing sprite or background frame!');
			return;
		}
		this.background.spriteFrame = this._buttonsService.backgrounds[this.betType];
	}
	updateIcon() {
		if (!this.icon || !this._buttonsService.icons[this.betCharacter]) {
			console.warn('Missing sprite or ICON frame!');
			return;
		}
		this.icon.spriteFrame = this._buttonsService.icons[this.betCharacter];
		this.iconOriginalScale = this.icon.node.getScale().clone();
	}

	showBetAmount(amount: number){
		this._totalBetAmount += amount;
		this.labelBetAmount.string = this._totalBetAmount.toString();
	}

	animateClick() {
		if (!this.icon) return;

		// Clone to avoid mutation
		const zoomedScale = this.iconOriginalScale.clone().multiplyScalar(1.2); // 20% larger

		tween(this.icon.node)
		.to(0.1, { scale: zoomedScale }, { easing: 'quadOut' }) // Zoom in
		.to(0.1, { scale: this.iconOriginalScale }, { easing: 'quadIn' }) // Zoom out
		.start();
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



}
