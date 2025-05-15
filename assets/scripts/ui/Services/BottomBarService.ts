import { _decorator, Component, SpriteFrame, Node, Prefab, instantiate } from 'cc';
import {LobbyService} from "db://assets/scripts/ui/Services/LobbyService";


const {ccclass, property} = _decorator;

@ccclass('BottomBarService')
export class BottomBarService extends Component {

	private _lobbyService: LobbyService = null;


	onLoad(){}
	//Getters and  Setters
	set lobbyService(value: LobbyService) {
		this._lobbyService = value;
	}


}
