import {_decorator, Component, SpriteFrame} from 'cc';
import {BetButton} from "db://assets/scripts/ui/BetButton";
import {BetType} from "db://assets/scripts/enums/BetOptions";
import {LobbyService} from "db://assets/scripts/ui/Services/LobbyService";
import {GameDataService} from "db://assets/scripts/services/GameDataService";

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

		this._buttons.forEach(button => {
			button.buttonsService = this
			button.node.on('click', () => {
				button.animateClick()
				this.selectButton(button.betType);
			});
		});
		this._initializeView()
	}

	public selectButton(betType: BetType) {
		this._selectedType = betType;
		// Update all buttons, activate the selected one
		this._buttons.forEach(button => {
			button.selected = (button.betType === betType)
		});
		this._lobbyService.placeBet()
	}

	public showBetAmount(betAmount: number){
		const selectedButton = this._buttons.find(button => button.selected);
		selectedButton.showBetAmount(betAmount)
	}
	public setButtonsInteractable(value: boolean): void {
		this._buttons.forEach(betButton => {
			betButton.setInteractive(value)
		});
	}

	clearBets() {
		this._buttons.forEach(betButton => {
			if(betButton.betAmount > 0){
				betButton.showBetAmount(-betButton.betAmount);
			}
		});
		this.setButtonsInteractable(true);
	}

	private _initializeView() {
		const betsInfo = GameDataService.instance.initData?.gameInfo?.betOptions;
		if (!betsInfo) return;

		this._buttons.forEach(button => {
			const betAmount = betsInfo[button.betType];
			if (betAmount !== undefined) {
				button.updateBetOptions(betAmount);
			}
		});
	}

	resolveBetTypeIndices(betType: string): { iconIndex: number, backgroundIndex: number } | null {
		const fixedIconIndexMap: Record<string, number> = {
			bank: 4,
			tie: 5,
			player: 6,
		};

		const fixedBackgroundIndexMap: Record<string, number> = {
			bank: 0,
			tie: 1,
			player: 2,
		};

		if (betType in fixedIconIndexMap) {
			return {
				iconIndex: fixedIconIndexMap[betType],
				backgroundIndex: fixedBackgroundIndexMap[betType],
			};
		}

		const match = betType.match(/^([A-Z])(\d)$/);
		if (!match) return null;

		const [, letter, number] = match;
		const iconIndex = letter.charCodeAt(0) - 'A'.charCodeAt(0); // A=0, B=1, ...
		const backgroundIndex = parseInt(number, 10) - 1; // 1-based to 0-based

		return { iconIndex, backgroundIndex };
	}

	//Getters and  Setters
	set lobbyService(value: LobbyService) {
		this._lobbyService = value;

	}
	public get selectedType(): BetType {
		return this._selectedType;
	}

	onDisable(){
		this._buttons.forEach(button => {
			button.node.off('click');
		});
		this._selectedType = null;
		this.setButtonsInteractable(false);
		this.clearBets();
		this._lobbyService = null;
	}
}
