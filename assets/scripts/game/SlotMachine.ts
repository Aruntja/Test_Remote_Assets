import { _decorator, Component, Node, Prefab, instantiate, SpriteFrame, Vec3, UITransform } from 'cc';
import { Reel } from './Reel';
import {BoardManager} from "db://assets/scripts/managers/BoardManager";
const { ccclass, property } = _decorator;

@ccclass('SlotMachine')
export class SlotMachine extends Component {


	@property(Prefab)
	reelPrefab: Prefab = null;

	@property(Prefab)
	slotSymbolPrefab: Prefab = null;

	@property(Node)
	reelContainer: Node = null;

	@property
	columns: number = 5;

	@property
	rows: number = 3;

	@property
	spinSpeed: number = 300;

	@property([SpriteFrame])
	symbols: SpriteFrame[] = [];


	private _boardManager: BoardManager = null
	public reelWidth: number = 0;
	private reels: Reel[] = [];
	private finishedReels = 0;



	async start() {
		this.reelWidth = this.node.getComponent(UITransform)?.width/this.columns;
	}

	public async _createReels() {
		if (!this.reelContainer) {
			console.error('❌ Reel container is not assigned!');
			return;
		}

		this.reelContainer.removeAllChildren();
		this.reels = [];

		const offsetX = -(this.columns - 1) * this.reelWidth * 0.5;

		const columnOffsetMap: Record<number, number> = {
			0: -7,
			1: -2,
			[this.columns - 1]:4
		};

		for (let i = 0; i < this.columns; i++) {
			const reelNode = instantiate(this.reelPrefab);

			const extraOffset = columnOffsetMap[i] ?? 0;
			const x = offsetX + i * this.reelWidth + extraOffset;

			reelNode.setPosition(new Vec3(x, 0, 0));
			this.reelContainer.addChild(reelNode);

			const reel: Reel = reelNode.getComponent(Reel);
			reel.slotMachine = this;
			reel.setData(this.symbols, this.rows, this.slotSymbolPrefab);
			reel._initializeSymbols();
			this.reels.push(reel);
			reel.reelIndex = i;
		}
	}


	public async spin() {
		this.finishedReels = 0;
		this._boardManager.isSpinning = true;
		for (let i = 0; i < this.reels.length; i++) {
			this.reels[i].startSpin();
		}
		await this._delay(1000);
		this.stopReelsStaggered()

	}
	stopReelsStaggered() {
		const stopDelay = 1500;
		for (let i = 0; i < this.reels.length; i++) {
			setTimeout(() => {
				this.reels[i].stopSpin(() => {
					this.finishedReels++;
					if (this.finishedReels === this.reels.length) {
						this._boardManager.onReelSpinComplete()
						console.log('🎉 All reels stopped');
					}
				});
			}, i * stopDelay);
		}
	}


	private _delay(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	//Getters and setters
	set boardManager(value: BoardManager) {
		this._boardManager = value;
	}

}
