import { _decorator, Component, Button, screen,Label, Toggle, Sprite } from 'cc';
import { LobbyService } from "db://assets/scripts/ui/Services/LobbyService";
import {EventBus} from "db://assets/scripts/core/EventBus";
import {GameEvents} from "db://assets/scripts/events/GameEvents";
import {UIUtil} from "db://assets/scripts/utils/UIUtilService";

const { ccclass, property } = _decorator;

@ccclass('SlotPanelService')
export class SlotPanelService extends Component {
	private _lobbyService: LobbyService = null;

	@property({ type: Button })
	fullScreenBtn: Button;
	@property({ type: Button })
	exitFullScreenBtn: Button;

	@property({ type: Toggle })
	balanceComp: Toggle;

	private _balanceCompToggleSprite: Sprite;

	@property({ type: Button })
	soundOnBtn: Button;
	@property({ type: Button })
	soundOffBtn: Button;

	@property({ type: Label })
	betAmountLabel: Label;

	@property({ type: Label })
	playerBalanceLabel: Label;

	private _isSoundOn: boolean = false;
	private _isCurrencyMode: boolean = true;

	onLoad() {
		if (this.fullScreenBtn) {
			this.fullScreenBtn.node.on(Button.EventType.CLICK, this.toggleFullscreen, this);
		}
		if (this.balanceComp) {
			this._balanceCompToggleSprite = this.balanceComp.node.getComponent(Sprite);
			this.balanceComp.node.on(Toggle.EventType.TOGGLE, this.toggleBalance, this);
		}
		this.soundOnBtn?.node.on(Button.EventType.CLICK, this.toggleSound, this);
		this.soundOffBtn?.node.on(Button.EventType.CLICK, this.toggleSound, this);
		this.toggleSound()
	}
	start(){
		this._setupEventListeners();
	}

	private toggleFullscreen() {
		if (screen.fullScreen()) {
			screen.exitFullScreen();
		} else {
			screen.requestFullScreen().then(() => {
				console.log("Entered fullscreen");
			}).catch((err) => {
				console.error("Fullscreen failed:", err);
			});
		}
	}
	private toggleBalance() {
		this._isCurrencyMode = !this.balanceComp.isChecked
		this._balanceCompToggleSprite.enabled = !this.balanceComp.isChecked
	}

	private toggleSound() {
		this._isSoundOn = !this._isSoundOn;
		this.soundOnBtn.node.active = this._isSoundOn;
		this.soundOffBtn.node.active = !this._isSoundOn;
	}
	private updateBetAmount(amount: number) {
		if (this.betAmountLabel) {
			UIUtil.queueTweenNumber(
				this.betAmountLabel, // unique key
				amount,
				0.1,
				(value: number) => {
					this.betAmountLabel.string =`BET ${value.toString()}`;
				},
				() => {
					this.betAmountLabel.string = `BET ${amount.toString()}`;
				}
			);
		}

	}
	private _setupEventListeners() {
		EventBus.on(GameEvents.ON_BET_AMOUNT_UPDATED, this.updateBetAmount, this)
	}

	// Remove event listener when destroyed
	onDestroy() {
		if (this.fullScreenBtn) {
			this.fullScreenBtn.node.off(Button.EventType.CLICK, this.toggleFullscreen, this);
		}
		if (this.balanceComp) {
			this.balanceComp.node.off(Toggle.EventType.TOGGLE, this.toggleBalance, this);
		}
		EventBus.off(GameEvents.ON_BET_AMOUNT_UPDATED, this.updateBetAmount, this)
	}
	// Getters and Setters
}