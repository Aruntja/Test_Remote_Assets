import { _decorator, Component } from 'cc';
import {TopBarService} from "db://assets/scripts/ui/Services/TopBarService";
import {BetButtonsService} from "db://assets/scripts/ui/Services/BetButtonsService";
import {BottomBarService} from "db://assets/scripts/ui/Services/BottomBarService";


const {ccclass, property} = _decorator;

@ccclass('LobbyService')
export class LobbyService extends Component {



	@property(TopBarService)
	topBarService: TopBarService = null;
	@property(BetButtonsService)
	betButtonsService: BetButtonsService = null;
	@property(BottomBarService)
	bottomBarService: BottomBarService = null;

	private _totalBetAmount: number = 0;
	private _betTimeOut: boolean = false;

	onLoad(){
		this.topBarService.lobbyService = this
		this.betButtonsService.lobbyService = this
		this.bottomBarService.lobbyService = this
		this.startTimer()
	}
	startTimer(){
		this.topBarService.startTimer()
		console.log("Start Timer")
	}

	set totalBetAmount(value: number) {
		this._totalBetAmount = value;
	}

	placeBet() {
		this.onBetPlaced()
	}
	onBetPlaced(){
		const betAmount= this.bottomBarService.selectedBetAmount
		this._totalBetAmount += betAmount
		this.betButtonsService.showBetAmount(betAmount)
		this.bottomBarService.updateButtonsInteractivity()
	}

	//Getters and Setters
	get totalBetAmount(): number {
		return this._totalBetAmount;
	}
	set betTimeOut(value: boolean) {
		this._betTimeOut = value;
	}

}
