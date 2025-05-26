import { _decorator, Component, Node, Label, Button } from 'cc';
import {TopBarService} from "db://assets/scripts/ui/Services/TopBarService";
import {BetButtonsService} from "db://assets/scripts/ui/Services/BetButtonsService";
import {BottomBarService} from "db://assets/scripts/ui/Services/BottomBarService";
import {EventBus} from "db://assets/scripts/core/EventBus";
import {GameEvents} from "db://assets/scripts/events/GameEvents";
import {UIUtil} from "db://assets/scripts/utils/UIUtilService";
import {I18nManager} from "db://assets/scripts/managers/I18nManager";


const {ccclass, property} = _decorator;

@ccclass('LobbyService')
export class LobbyService extends Component {

	@property(TopBarService)
	topBarService: TopBarService = null;
	@property(BetButtonsService)
	betButtonsService: BetButtonsService = null;
	@property(BottomBarService)
	bottomBarService: BottomBarService = null;

	@property(Node)
	confirmBetsPopup?: Node;

	@property(Button)
	confirmBetsYesBtn?: Button;
	@property(Button)
	confirmBetsNoBtn?: Button;

	@property(Node)
	closedBetNode!: Node;

	private _totalBetAmount: number = 0;
	private _betTimerCountDownDone: boolean = false;
	private _wasPreviousRoundBetPlaced: boolean = false;

	onLoad(){
		this._setupEventListeners();
		this.topBarService.lobbyService = this
		this.betButtonsService.lobbyService = this
		this.bottomBarService.lobbyService = this
		this.startTimer()
	}
	start(){
		if(this.confirmBetsPopup) this.confirmBetsPopup.active = false;
		this.closedBetNode.getComponent(Label).string = I18nManager.instance.t('betsClosed')
	}
	startTimer(){
		this.topBarService.startTimer()
		console.log("Start Timer")
	}

	betClosed(){
		// this._betTimerCountDownDone = true;
		EventBus.emit(GameEvents.ON_BET_COUNTDOWN_ENDED)
	}


	placeBet() {
		this.onBetPlaced()
	}
	openConfirmBetsPopup() {
		UIUtil.zoomInOut(this.confirmBetsPopup, 1.2)
	}
	onBetsConfirmed() {
		UIUtil.zoomOutIn(this.confirmBetsPopup, 1.2)
		this.bottomBarService.isBetConfirmed = true;
		this.betButtonsService.setButtonsInteractable(false)
	}
	onBetPlaced(){
		if(this._betTimerCountDownDone) {
			this.betButtonsService.setButtonsInteractable(false)
			this.closedBetNode.active = true
			UIUtil.zoomInOut(this.closedBetNode, 1.3, 0.3, ()=>{
				this.closedBetNode.active = false
				this.betButtonsService.setButtonsInteractable(true)
			})
			return
		}
		const betAmount= this.bottomBarService.selectedBetAmount
		this._totalBetAmount += betAmount
		this.betButtonsService.showBetAmount(betAmount)
		this.bottomBarService.updateBetInteractivity()
		EventBus.emit(GameEvents.ON_BET_AMOUNT_UPDATED, this._totalBetAmount)
	}
	clearAllUnconfirmedBets() {
		this.betButtonsService.clearBets();
		this._totalBetAmount = 0;
		this.bottomBarService.updateBetInteractivity()
	}
	private sendConfirmationRequest(event: any) {
		if(event === this.confirmBetsYesBtn){
			this.onBetsConfirmed()
		} else if(event === this.confirmBetsNoBtn){
			UIUtil.zoomOutIn(this.confirmBetsPopup, 1.2);
		}
	}
	private _setupEventListeners() {
		this.confirmBetsYesBtn?.node.on(Button.EventType.CLICK, this.sendConfirmationRequest, this );
		this.confirmBetsNoBtn?.node.on(Button.EventType.CLICK, this.sendConfirmationRequest, this );
	}
	onDestroy(){
		this.confirmBetsYesBtn?.node.off(Button.EventType.CLICK, this.sendConfirmationRequest, this );
		this.confirmBetsNoBtn?.node.off(Button.EventType.CLICK, this.sendConfirmationRequest, this );
	}

	//Getters and Setters
	get totalBetAmount(): number {
		return this._totalBetAmount;
	}
	get wasPreviousRoundBetPlaced(): boolean {
		return this._wasPreviousRoundBetPlaced;
	}
	set betTimerCountDownDone(value: boolean) {
		this._betTimerCountDownDone = value;
	}
	set totalBetAmount(value: number) {
		this._totalBetAmount = value;
	}

}
