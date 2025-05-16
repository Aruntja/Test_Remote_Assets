import { _decorator, Component, Label, Sprite, SpriteFrame, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BetChip')
export class BetChip extends Component {

	@property(Sprite)
	sprite: Sprite = null;

	@property(Label)
	valueLabel: Label = null;

	private _value: number = 0;
	private _selected = false;

	public setValue(value: number) {
		this._value = value;
		if (this.valueLabel) {
			this.valueLabel.string = value.toString();
		}
	}

	public getValue(): number {
		return this._value;
	}

	public setSprite(frame: SpriteFrame) {
		if (this.sprite) {
			this.sprite.spriteFrame = frame;
		}
	}

	public setSelected(selected: boolean) {
		this._selected = selected;
		const targetScale = selected ? new Vec3(1.2, 1.2, 1) : new Vec3(1, 1, 1);
		tween(this.node)
		.to(0.2, { scale: targetScale }, { easing: 'quadOut' })
		.start();
	}

	public isSelected(): boolean {
		return this._selected;
	}
}
