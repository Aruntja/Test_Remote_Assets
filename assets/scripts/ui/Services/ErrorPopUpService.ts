import { _decorator, Component, SpriteFrame, Node, Label, Button } from 'cc';
import {I18nManager} from "db://assets/scripts/managers/I18nManager";


const {ccclass, property} = _decorator;

@ccclass('ErrorPopUpService')
export class ErrorPopUpService extends Component {

	@property(Label)
	headerLbl: Label = null;
	@property(Label)
	messageLbl: Label = null;
	@property(Label)
	errorLbl: Label = null;
	@property(Label)
	actionLbl: Label = null;
	@property(Label)
	instructionLbl: Label = null;

	@property(Button)
	okBtn: Button = null;

	@property(Button)
	cancelBtn: Button = null;

	private errorCodeTxt: string = null;
	private headerTxt: string = null;

	onLoad() {
		this.headerTxt = I18nManager.instance.t('error').toUpperCase();
		this.errorCodeTxt = I18nManager.instance.t('errorCode');
	}
	start() {
		this.headerLbl.string = this.headerTxt
	}
	showPopUp(error: any, isSocketError: boolean){
		console.log(error)
		if(isSocketError){
			this.messageLbl.string = error
		}
		else{
			this.errorLbl.string = `${this.errorCodeTxt}: ${error.status}`
		}
	}

	//Getters and  Setters

}
