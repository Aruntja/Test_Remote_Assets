import { _decorator, Component, SpriteFrame, Node, Label, Button } from 'cc';
import {ComponentSingleton} from "db://assets/scripts/core/ComponentSingleton";


const {ccclass, property} = _decorator;

@ccclass('ErrorPopUpService')
export class ErrorPopUpService extends ComponentSingleton<ErrorPopUpService> {

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


	onLoad() {

	}
	start() {

	}

	//Getters and  Setters

}
