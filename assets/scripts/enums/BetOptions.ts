import { _decorator, Component, SpriteFrame, Enum } from 'cc';
const { ccclass, property } = _decorator;

export enum BetType {
	'BANKER',
	'TIE',
	'PLAYER',
	SPECIAL
}
export enum BetCharacters {
	'WUKONG',
	'ZHU_BAIJE',
	'TANG_SHAZANG',
	'SHA_WUJING',
	"BANKER",
	"TIE",
	"PLAYER"
}
export enum BetSymbols {
	"SYMB_1",
	"SYMB_2",
	"SYMB_3",
	"SYMB_4",

}

@ccclass('MarqueeSymbolConfig')
export class MarqueeSymbolConfig {
	@property(SpriteFrame)
	image: SpriteFrame = null;

	@property({ type: Enum(BetType) })
	betType: BetType = BetType.BANKER;
}


