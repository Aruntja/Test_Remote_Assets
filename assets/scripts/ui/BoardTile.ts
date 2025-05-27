import { _decorator, Component, Sprite, SpriteFrame, Color, tween, Vec3 } from 'cc';
import {BetType} from "db://assets/scripts/enums/BetOptions";
import {MarqueeSymbolConfig} from "db://assets/scripts/enums/Miscellaneous";
const { ccclass, property } = _decorator;

@ccclass('BoardTile')
export class BoardTile extends Component {
    @property(Sprite)
    icon: Sprite = null;

    @property(Color)
    baseColor: Color = new Color(68, 68, 68); // Default inactive color

    @property(Color)
    glowColor: Color = new Color(255, 255, 255); // Active glow color

    @property
    maxGlowScale: number = 1.2;

    public tileIndex: number = 0;
    private _defaultScale: Vec3 = new Vec3(1, 1, 1);
    betType: BetType = BetType.BANK;

    onLoad() {
        this._defaultScale = this.node.scale.clone();
        this.icon.color = this.baseColor;
    }

    setData(data: MarqueeSymbolConfig) {
        if (this.icon && data.image) {
            this.icon.spriteFrame = data.image;
        }
        if(data.betType) this.betType = data.betType
    }

    setActiveGlow(active: boolean) {
        if (active) {
            this.icon.color = this.glowColor
            // tween(this.icon)
            // .to(0.2, { color: this.glowColor })
            // .start();

            tween(this.node)
            .to(0.2, { scale: new Vec3(this.maxGlowScale, this.maxGlowScale, 1) })
            .start();
        } else {
            this.icon.color = this.baseColor

            // tween(this.icon)
            // .to(0.2, { color: this.baseColor })
            // .start();

            tween(this.node)
            .to(0.2, { scale: this._defaultScale })
            .start();
        }
    }

    // setGlowIntensity(intensity: number) {
    //     const currentColor = new Color();
    //     Color.lerp(currentColor, this.baseColor, this.glowColor, intensity);
    //
    //     const currentScale = 1 + (this.maxGlowScale - 1) * intensity;
    //
    //     this.icon.color = currentColor;
    //     this.node.setScale(new Vec3(currentScale, currentScale, 1));
    // }

    pulseEffect(duration: number = 0.3) {
        tween(this.node)
        .to(duration/2, { scale: new Vec3(1.3, 1.3, 1) })
        .to(duration/2, { scale: this._defaultScale })
        .start();
    }

    resetVisuals() {
        this.icon.color = this.baseColor;
        this.node.setScale(this._defaultScale);
    }

    setGlowOpacity(intensity: number) {
        const currentColor = new Color();
        Color.lerp(currentColor, this.baseColor, this.glowColor, intensity);

        const currentScale = 1 + (this.maxGlowScale - 1) * intensity;

        this.icon.color = currentColor;
        this.node.setScale(new Vec3(currentScale, currentScale, 1));
    }
}