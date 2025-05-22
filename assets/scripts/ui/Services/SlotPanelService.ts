import { _decorator, Component, Button, screen,Label, Toggle, Sprite,Node,UIOpacity, Vec3, tween, easing } from 'cc';
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
	soundOnBtn: Button;
	@property({ type: Button })
	soundOffBtn: Button;

	@property({ type: Button })
	musicOnBtn: Button;
	@property({ type: Button })
	musicOffBtn: Button;

	@property({ type: Button })
	menuBtn: Button;

	@property({ type: Toggle })
	balanceComp: Toggle;

	@property({ type: Label })
	betAmountLabel: Label;

	@property({ type: Label })
	playerBalanceLabel: Label;

	@property({ type: Node })
	menuGroup: Node;


	private _balanceCompToggleSprite: Sprite;

	private _isMusicOn: boolean = false;
	private _isSoundOn: boolean = false;
	private _isMenuOpen: boolean = true;
	private _isCurrencyMode: boolean = true;
	private _originalMenuPosition: Vec3 = new Vec3();

	onLoad() {

		if (this.fullScreenBtn) {
			this.fullScreenBtn.node.on(Button.EventType.CLICK, this.toggleFullscreen, this);
		}
		if (this.menuBtn) {
			this.menuBtn.node.on(Button.EventType.CLICK, this.toggleMenu, this);
		}
		if (this.balanceComp) {
			this._balanceCompToggleSprite = this.balanceComp.node.getComponent(Sprite);
			this.balanceComp.node.on(Toggle.EventType.TOGGLE, this.toggleBalance, this);
		}
		this.soundOnBtn?.node.on(Button.EventType.CLICK, this.toggleSound, this);
		this.soundOffBtn?.node.on(Button.EventType.CLICK, this.toggleSound, this);
		this.toggleSound()

		this.musicOnBtn?.node.on(Button.EventType.CLICK, this.toggleMusic, this);
		this.musicOffBtn?.node.on(Button.EventType.CLICK, this.toggleMusic, this);
		this.toggleMusic()

		this._originalMenuPosition = this.menuGroup.getPosition().clone();
		this.toggleMenu()
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
	private toggleMenu() {
		this._isMenuOpen = !this._isMenuOpen;

		if (this._isMenuOpen) {
			this.menuGroup.active = true;
			this.menuGroup.setPosition(this._originalMenuPosition.clone().add(new Vec3(500, 0, 0)));
		}

		const targetPos = this._isMenuOpen
			? this._originalMenuPosition
			: this._originalMenuPosition.clone().add(new Vec3(500, 0, 0));

		tween(this.menuGroup)
		.to(0.2, { position: targetPos }, {
			easing: easing.expoInOut,
			onComplete: () => {
				if (!this._isMenuOpen) {
					this.menuGroup.active = false;
				}
			}
		})
		.start();
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

	private toggleMusic() {
		this._isMusicOn = !this._isMusicOn;
		this.musicOnBtn.node.active = this._isMusicOn;
		this.musicOffBtn.node.active = !this._isMusicOn;
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
		if (this.menuBtn) {
			this.menuBtn.node.off(Button.EventType.CLICK, this.toggleMenu, this);
		}
		this.soundOnBtn?.node.off(Button.EventType.CLICK, this.toggleSound, this);
		this.soundOffBtn?.node.off(Button.EventType.CLICK, this.toggleSound, this);
		this.musicOnBtn?.node.off(Button.EventType.CLICK, this.toggleMusic, this);
		this.musicOffBtn?.node.off(Button.EventType.CLICK, this.toggleMusic, this);
		EventBus.off(GameEvents.ON_BET_AMOUNT_UPDATED, this.updateBetAmount, this)
	}
	// Getters and Setters
}