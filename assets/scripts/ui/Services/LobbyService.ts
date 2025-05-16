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

	onLoad(){
		this.topBarService.lobbyService = this
		this.betButtonsService.lobbyService = this
		this.bottomBarService.lobbyService = this
		this.startTimer()
	}
	startTimer(){
		console.log("Start Timer")
	}

}
