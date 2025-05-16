import {_decorator, Component, SpriteFrame} from 'cc';
import {BetButton} from "db://assets/scripts/ui/BetButton";
import {BetCharacters, BetType} from "db://assets/scripts/enums/BetOptions";
import {LobbyService} from "db://assets/scripts/ui/Services/LobbyService";

const {ccclass, property} = _decorator;

@ccclass('BetButtonsService')
export class BetButtonsService extends Component {

	@property({type: [SpriteFrame]})
	backgrounds: SpriteFrame[] = [];

	@property({type: [SpriteFrame]})
	icons: SpriteFrame[] = [];

	private _lobbyService: LobbyService = null;


	private _buttons: BetButton[] = [];
	private _selectedType: BetType = null;

	onLoad() {
		this._buttons = this.getComponentsInChildren(BetButton);

		// Optionally, add event listeners for button clicks to update selection
		this._buttons.forEach(button => {
			button.buttonsService = this
			button.node.on('click', () => {
				button.animateClick()
				this.selectButton(button.betType, button.betCharacter);
			});
		});
	}

	public selectButton(betType: BetType, betCharacter: BetCharacters) {
		this._selectedType = betType;
		// Update all buttons, activate the selected one
		this._buttons.forEach(button => {
			button.selected = (button.betType === betType && button.betCharacter === betCharacter)
		});
		this._lobbyService.placeBet()
	}

	public showBetAmount(betAmount: number){
		const selectedButton = this._buttons.find(button => button.selected);
		selectedButton.showBetAmount(betAmount)
	}
	public get selectedType(): BetType {
		return this._selectedType;
	}

	//Getters and  Setters
	set lobbyService(value: LobbyService) {
		this._lobbyService = value;
	}

}
