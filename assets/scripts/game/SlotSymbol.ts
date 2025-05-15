import { _decorator, Component, Sprite, SpriteFrame } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SlotSymbol')
export class SlotSymbol extends Component {

	@property(Sprite)
	normalSprite: Sprite = null;

	@property(Sprite)
	blurredSprite: Sprite = null;

	/**
	 * Sets the icons for both normal and blurred appearance
	 */
	public setIcon(normal: SpriteFrame, blurred: SpriteFrame) {
		if (this.normalSprite) {
			this.normalSprite.spriteFrame = normal;
		}
		if (this.blurredSprite) {
			this.blurredSprite.spriteFrame = blurred;
		}
	}

	/**
	 * Show the blurred icon (used during spin)
	 */
	public showBlur() {
		if (this.normalSprite) this.normalSprite.node.active = false;
		if (this.blurredSprite) this.blurredSprite.node.active = true;
	}

	/**
	 * Show the normal icon (used when reel stops)
	 */
	public showNormal() {
		if (this.normalSprite) this.normalSprite.node.active = true;
		if (this.blurredSprite) this.blurredSprite.node.active = false;
	}
}
