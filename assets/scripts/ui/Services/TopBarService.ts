import { _decorator, Component, SpriteFrame, Node, Prefab, instantiate } from 'cc';
import {BetType} from "db://assets/scripts/enums/BetOptions";
import {BetOptionChip} from "db://assets/scripts/ui/BetOptionChip";
import {UIUtil} from "db://assets/scripts/utils/UIUtilService";
import {LobbyService} from "db://assets/scripts/ui/Services/LobbyService";


const {ccclass, property} = _decorator;

@ccclass('TopBarService')
export class TopBarService extends Component {

	@property({type: [SpriteFrame]})
	betChipOptions: SpriteFrame[] = [];

	@property({type: [SpriteFrame]})
	betTypes: SpriteFrame[] = [];

	@property(Node)
	betOptionChipsContainer: Node = null;

	@property(Prefab)
	betOptionChipPrefab: Prefab = null;


	private betOptionsCount: number = 8;
	private _selectedType: BetType = null;
	private _lobbyService: LobbyService = null;

	onLoad() {

	}
	start() {
		for (let i = 0; i < this.betOptionsCount; i++) {
			const chipNode = instantiate(this.betOptionChipPrefab);
			const chip = chipNode.getComponent(BetOptionChip);
			if (chip) {
				chip.initializeChip( UIUtil.getRandomItem(this.betChipOptions), UIUtil.getRandomItem(this.betTypes))
			}

			this.betOptionChipsContainer.addChild(chipNode);
		}
	}

	//Getters and  Setters
	set lobbyService(value: LobbyService) {
		this._lobbyService = value;
	}


}
