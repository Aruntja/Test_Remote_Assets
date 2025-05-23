import { _decorator, Component, Node } from 'cc';
import {TopBarService} from "db://assets/scripts/ui/Services/TopBarService";
import {BetButtonsService} from "db://assets/scripts/ui/Services/BetButtonsService";
import {BottomBarService} from "db://assets/scripts/ui/Services/BottomBarService";
import {EventBus} from "db://assets/scripts/core/EventBus";
import {GameEvents} from "db://assets/scripts/events/GameEvents";
import {UIUtil} from "db://assets/scripts/utils/UIUtilService";


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
	closedBetNode!: Node;

	private _totalBetAmount: number = 0;
	private _betTimerCountDownDone: boolean = false;

	onLoad(){
		this.topBarService.lobbyService = this
		this.betButtonsService.lobbyService = this
		this.bottomBarService.lobbyService = this
		this.startTimer()
	}
	start(){
	}
	startTimer(){
		this.topBarService.startTimer()
		console.log("Start Timer")
	}

	betClosed(){
		this._betTimerCountDownDone = true;
		EventBus.emit(GameEvents.ON_BET_COUNTDOWN_ENDED)
	}

	set totalBetAmount(value: number) {
		this._totalBetAmount = value;
	}

	placeBet() {
		this.onBetPlaced()
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
		this.bottomBarService.updateButtonsInteractivity()
		EventBus.emit(GameEvents.ON_BET_AMOUNT_UPDATED, this._totalBetAmount)
	}

	//Getters and Setters
	get totalBetAmount(): number {
		return this._totalBetAmount;
	}
	set betTimerCountDownDone(value: boolean) {
		this._betTimerCountDownDone = value;
	}

}
