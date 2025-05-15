import { _decorator, Component, Sprite, SpriteFrame } from 'cc';


const { ccclass, property } = _decorator;

@ccclass('BetOptionChip')
export class BetOptionChip extends Component {

	@property(Sprite)
	betOptionImage!: Sprite;

	@property(Sprite)
	betTypeImage!: Sprite;

    initializeChip(betOptionImage: SpriteFrame, betTypeImage: SpriteFrame) {
		this.betOptionImage.spriteFrame = betOptionImage
		this.betTypeImage.spriteFrame = betTypeImage
    }

}
