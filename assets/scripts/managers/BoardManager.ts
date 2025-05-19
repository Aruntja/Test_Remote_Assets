import { _decorator, Component, Input, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;
import {MarqueeRing} from "db://assets/scripts/game/MarqueeRing";
import {SlotMachine} from "db://assets/scripts/game/SlotMachine";

@ccclass('BoardManager')
export class BoardManager extends Component {



    @property(MarqueeRing)
    marqueeRing: MarqueeRing = null;
    @property(SlotMachine)
    slotMachine: SlotMachine = null;

    @property(Sprite)
    winImage: Sprite = null;

    @property([SpriteFrame])
    winImages: SpriteFrame[] = [];

    private _initializationComplete: boolean;
    private _isSpinning: boolean;
    private _isMarqueeSpinning: boolean;

    async start() {
        await this._initializeComponents()
        console.log(`----- Game Board Initialised -----`)
    }

    private async _initializeComponents(): Promise<void> {
        try {
            this._setupEventListeners();
            this.marqueeRing.boardManager = this;
            this.slotMachine.boardManager = this;
            if(this.marqueeRing) await this.marqueeRing.createBoardTiles()
            if(this.slotMachine) await this.slotMachine._createReels()
            this.marqueeRing.startGlowLoop()
            this._isMarqueeSpinning = true
            await this.slotMachine.spin()
        } catch (error) {
            console.error("Initialization failed:", error);
        }
    }


    private _setupEventListeners() {
        
    }

    updateCurrentTile() {
        this.winImage.spriteFrame = this.winImages[Math.floor(Math.random() * this.winImages.length)];
    }
    async onReelSpinComplete(){
        this.isSpinning = false;
        await this.marqueeRing.showWin(21)
    }

    async marqueeRingSpinComplete() {
        this._isMarqueeSpinning = false;
    }
    //Getters and Setters
    get isInitialized(): boolean {
        return this._initializationComplete;
    }
    get isSpinning(): boolean {
        return this._isSpinning;
    }

    set isSpinning(value: boolean) {
        this._isSpinning = value;
    }

}
