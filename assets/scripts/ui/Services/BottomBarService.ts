import { _decorator, Component, Button, Label } from 'cc';
import {LobbyService} from "db://assets/scripts/ui/Services/LobbyService";
import {BetChipBar} from "db://assets/scripts/ui/BetChipBar";
import {I18nManager} from "db://assets/scripts/managers/I18nManager";

const {ccclass, property} = _decorator;

@ccclass('BottomBarService')
export class BottomBarService extends Component {

	private _lobbyService: LobbyService = null;

	@property (BetChipBar)
	betChipBar: BetChipBar = null

	@property (Button)
	repeatOrConfirmButton?: Button;
	@property (Button)
	removeButton?: Button;
	@property (Button)
	clearButton?: Button;
	@property (Button)
	autoBetButton?: Button;

	private repeatLabel?: Label;
	private removeLabel?: Label;
	private clearLabel?: Label;
	private autoBetLabel?: Label;

	private confirmString?: string;
	private repeatString?: string;
	private _isBetConfirmed: boolean= false;

	onLoad(){
		this.repeatOrConfirmButton?.node.on(Button.EventType.CLICK, this.repeatOrConfirmBet, this);
		this.clearButton?.node.on(Button.EventType.CLICK, this.clearBet, this);
	}

	start() {
		this.repeatLabel = this.repeatOrConfirmButton.node.getComponentInChildren(Label);
		this.removeLabel = this.removeButton.node.getComponentInChildren(Label);
		this.clearLabel = this.clearButton.node.getComponentInChildren(Label);
		this.autoBetLabel = this.autoBetButton.node.getComponentInChildren(Label);
		this.confirmString = I18nManager.instance.t('confirm').toUpperCase();
		this.repeatString = I18nManager.instance.t('repeat').toUpperCase();

		if(this.repeatLabel && this.repeatString) this.repeatLabel.string = this.repeatString;
		if(this.removeLabel) this.removeLabel.string = I18nManager.instance.t('remove').toUpperCase()
		if(this.clearLabel) this.clearLabel.string = I18nManager.instance.t('clear').toUpperCase()
		if(this.autoBetLabel) this.autoBetLabel.string = I18nManager.instance.t('autoBet').toUpperCase()
	}

	updateBetInteractivity() {
		if (this._lobbyService.totalBetAmount > 0){
			this.repeatLabel.string = this.confirmString;
			this.repeatOrConfirmButton.interactable = true;
			this.clearButton.interactable = true;
		}else{
			this.repeatLabel.string = this.repeatString;
			this.clearButton.interactable = false;
			this.repeatOrConfirmButton.interactable = this._lobbyService.wasPreviousRoundBetPlaced
		}
	}
	private repeatOrConfirmBet(){
		if(this._lobbyService.totalBetAmount > 0){
			this._lobbyService.openConfirmBetsPopup()
		}else{
			console.log('repeating bet');
		}
	}

	private clearBet(){
		if(this._lobbyService.totalBetAmount <= 0 || this._isBetConfirmed) return;
		this._lobbyService.clearAllUnconfirmedBets();
	}

	//Getters and Setters
	get selectedBetAmount(): number {
		return this.betChipBar.selectedBetAmount;
	}
	set lobbyService(value: LobbyService) {
		this._lobbyService = value;
	}
	set isBetConfirmed(value: boolean) {
		this._isBetConfirmed = value;
		this.repeatOrConfirmButton.interactable = !this._isBetConfirmed;
		this.clearButton.interactable = !this._isBetConfirmed;
	}
	get isBetConfirmed(): boolean {
		return this._isBetConfirmed;
	}


}
