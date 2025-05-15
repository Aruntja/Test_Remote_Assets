import { _decorator, Component, Sprite, SpriteFrame, Color } from 'cc'; // <-- Add Color
const { ccclass, property } = _decorator;

@ccclass('BoardTile')
export class BoardTile extends Component {

    @property(Sprite)
    icon: Sprite = null;

    public tileIndex: number = 0;

    private activeColor: Color = new Color(255, 255, 255);
    private inactiveColor: Color = new Color(68, 68, 68);   // Dark gray

    setIcon(spriteFrame: SpriteFrame) {
        if (this.icon && spriteFrame) {
            this.icon.spriteFrame = spriteFrame;
        }
    }

    setActiveGlow(active: boolean) {
        this.icon.color = active ? this.activeColor : this.inactiveColor;
    }
}
