import {_decorator, Component, Sprite, SpriteFrame} from 'cc';
import {MarqueeRing} from "db://assets/scripts/game/MarqueeRing";
import {SlotMachine} from "db://assets/scripts/game/SlotMachine";
import {BetType} from '../enums/BetOptions';
import {EventBus} from "db://assets/scripts/core/EventBus";
import {GameEvents} from "db://assets/scripts/events/GameEvents";

const { ccclass, property } = _decorator;

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

    private startMainGameBind: () => void;

    onLoad(){
        this.startMainGameBind = this.startMainGame.bind(this)

    }
    async start() {
        this._setupEventListeners();
        await this._initializeComponents()
        console.log(`Game Board Initialised`)
    }


    private async _initializeComponents(): Promise<void> {
        try {
            this.marqueeRing.boardManager = this;
            this.slotMachine.boardManager = this;
            this._initializationComplete = true;

        } catch (error) {
            console.error("Initialization failed:", error);
        }
    }


    private _setupEventListeners() {
        EventBus.on(GameEvents.START_MAIN_GAME, this.startMainGameBind)
    }

    private async startMainGame() {
        if (this.marqueeRing) await this.marqueeRing.createBoardTiles()
        if (this.slotMachine) await this.slotMachine._createReels()
         if(this.marqueeRing)   this.marqueeRing.startGlowLoop()
        this._isMarqueeSpinning = true
        await this.slotMachine.spin()
    }
    updateCurrentTile(betType: BetType) {
        if (betType === BetType.PLAYER || betType === BetType.BANK || betType=== BetType.TIE) return;
        this.winImage.spriteFrame = this.winImages[this.getNumberIndex(betType)];
    }

    private getNumberIndex(betType: BetType): number {
        const match = betType.match(/\d+/); // Extract digits
        if (match) {
            const number = parseInt(match[0], 10);
            return number - 1; // 1-based to 0-based
        }
        return -1; // Invalid case
    }


    async onReelSpinComplete(){
        this.isSpinning = false;
        await this.marqueeRing.showWin(10)
    }

    async marqueeRingSpinComplete() {
        this._isMarqueeSpinning = false;
        if(!this._isSpinning){
            EventBus.emit(GameEvents.END_MAIN_GAME)
        }
    }
    onDestroy() {
        EventBus.off(GameEvents.START_MAIN_GAME, this.startMainGameBind)
        this._initializationComplete = false;
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
