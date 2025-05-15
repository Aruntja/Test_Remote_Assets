import { _decorator, Component, Input } from 'cc';
import {MarqueeRing} from "db://assets/scripts/game/MarqueeRing";
import {SlotMachine} from "db://assets/scripts/game/SlotMachine";
const { ccclass, property } = _decorator;

@ccclass('BoardManager')
export class BoardManager extends Component {


    @property(MarqueeRing)
    marqueeRing: MarqueeRing = null;

    @property(SlotMachine)
    slotMachine: SlotMachine = null;

    private _initializationComplete: boolean;

    async start() {
        await this._initializeComponents()
        console.log(`----- Game Board Initialised -----`)
    }

    private async _initializeComponents(): Promise<void> {
        try {
            this._setupEventListeners();
            if(this.marqueeRing) await this.marqueeRing.createBoardTiles()
            if(this.slotMachine) await this.slotMachine._createReels()
            this.marqueeRing.startGlowLoop()
            await this.slotMachine.spin()
        } catch (error) {
            console.error("Initialization failed:", error);
        }
    }


    private _setupEventListeners() {
        
    }


    //Getters and Setters
    get isInitialized(): boolean {
        return this._initializationComplete;
    }
}
