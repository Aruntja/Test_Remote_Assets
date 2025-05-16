import { _decorator, Component, Button, Node, Prefab, instantiate } from 'cc';
import {LobbyService} from "db://assets/scripts/ui/Services/LobbyService";
import {BetChipBar} from "db://assets/scripts/ui/BetChipBar";


const {ccclass, property} = _decorator;

@ccclass('BottomBarService')
export class BottomBarService extends Component {


	private _lobbyService: LobbyService = null;

	@property (BetChipBar)
	betChipBar: BetChipBar = null

	@property (Button)
	repeatButton: Button = null
	@property (Button)
	removeButton: Button = null
	@property (Button)
	clearButton: Button = null
	@property (Button)
	autoBetButton: Button = null

	onLoad(){}
	//Getters and  Setters
	set lobbyService(value: LobbyService) {
		this._lobbyService = value;
	}

	start(){}

	//Getters and Setters
	get selectedBetAmount(): number {
		return this.betChipBar.selectedBetAmount;
	}

	updateButtonsInteractivity() {
		this.clearButton.interactable = this._lobbyService.totalBetAmount > 0
	}
}
