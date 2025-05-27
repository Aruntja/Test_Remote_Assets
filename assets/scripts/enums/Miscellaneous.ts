import { _decorator, Component, SpriteFrame, Enum } from 'cc';
import {BetType} from "db://assets/scripts/enums/BetOptions";
const { ccclass, property } = _decorator;


@ccclass('MarqueeSymbolConfig')
export class MarqueeSymbolConfig {
	@property(SpriteFrame)
	image: SpriteFrame = null;

	@property({ type: Enum(BetType) }) // 👈 This enables dropdown
	betType: BetType = BetType.BANK;
}

@ccclass('BetChipConfig')
export class BetChipConfig {
	@property(SpriteFrame)
	image: SpriteFrame = null;

	@property
	value: number = 0;
}


