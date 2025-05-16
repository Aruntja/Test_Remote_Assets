import { _decorator, Component, SpriteFrame, Node, Prefab, instantiate } from 'cc';
import {LobbyService} from "db://assets/scripts/ui/Services/LobbyService";
import {BetChipBar} from "db://assets/scripts/ui/BetChipBar";


const {ccclass, property} = _decorator;

@ccclass('BottomBarService')
export class BottomBarService extends Component {


	private _lobbyService: LobbyService = null;

	@property (BetChipBar)
	betChipBar: BetChipBar = null

	onLoad(){}
	//Getters and  Setters
	set lobbyService(value: LobbyService) {
		this._lobbyService = value;
	}

	start(){
		console.log(this.selectedBetAmount)
	}

	//Getters and Setters
	get selectedBetAmount(): number {
		return this.betChipBar.selectedBetAmount;
	}

}
