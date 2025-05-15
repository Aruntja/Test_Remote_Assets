import {
	_decorator, Component, instantiate, Node, Prefab,
	SpriteFrame, UITransform,
} from 'cc';
import { SlotSymbol } from "db://assets/scripts/game/SlotSymbol";
import { SlotMachine } from "db://assets/scripts/game/SlotMachine";

const { ccclass, property } = _decorator;

@ccclass('Reel')
export class Reel extends Component {

	symbols: SpriteFrame[] = [];
	rows: number;
	slotSymbolPrefab: Prefab = null;

	@property(Node)
	symbolContainer: Node = null;

	private _reelIndex: number = 0;
	private _slotMachine: SlotMachine;
	private _reelSlotSymbols: SlotSymbol[] = [];
	private _symbolNodes: Node[] = [];

	private symbolSize: number;
	private totalRows: number;

	private _isSpinning = false;
	private _pendingStop = false;
	private _onStopCallback: Function | null = null;
	private _stopRequestedTime: number = 0;

	private _topSymbolNode: Node | null = null;

	// Object Pool for symbols
	private _symbolPool: Node[] = [];

	public set slotMachine(value: SlotMachine) {
		this._slotMachine = value;
	}

	public setData(symbols: SpriteFrame[], rows: number, slotSymbolPrefab: Prefab) {
		this.symbols = symbols;
		this.rows = rows;
		this.slotSymbolPrefab = slotSymbolPrefab;
	}

	public _initializeSymbols() {
		this.totalRows = this.rows + 2;
		this.symbolSize = this._slotMachine.reelWidth;

		this.symbolContainer.getComponent(UITransform).setContentSize(
			this.symbolSize,
			this.symbolSize * this.totalRows
		);

		if (this.symbols.length === 0) {
			console.error('❌ No symbols assigned to the reel!');
			return;
		}

		this._reelSlotSymbols = [];
		this._symbolNodes = [];
		this.symbolContainer.removeAllChildren();

		const centerIndex = Math.floor(this.totalRows / 2);

		for (let i = 0; i < this.totalRows; i++) {
			const symbolNode = this._getSymbolNode();
			symbolNode.getComponent(UITransform).setContentSize(this.symbolSize, this.symbolSize);

			const slotSymbol: SlotSymbol = symbolNode.getComponent(SlotSymbol);
			const randomIndex = Math.floor(Math.random() * this.symbols.length);

			symbolNode.setPosition(0, (centerIndex - i) * this.symbolSize * 1.3, 0);
			slotSymbol.setIcon(this.symbols[randomIndex], this.symbols[randomIndex]);

			this.symbolContainer.addChild(symbolNode);
			this._reelSlotSymbols.push(slotSymbol);
			this._symbolNodes.push(symbolNode);
		}
	}

	public startSpin() {
		this._isSpinning = true;
		this._pendingStop = false;
		this._onStopCallback = null;
	}

	public stopSpin(callback: Function) {
		this._pendingStop = true;
		this._onStopCallback = callback;
		this._stopRequestedTime = performance.now(); // record the time stop was requested
	}

	update(dt: number) {
		if (!this._isSpinning) return;

		const speed = this._slotMachine.spinSpeed;
		for (let node of this._symbolNodes) {
			let pos = node.getPosition();
			pos.y -= speed * dt;
			node.setPosition(pos);
		}

		this._wrapSymbols();

		// Delayed stop check
		if (this._pendingStop) {
			const now = performance.now();
			const delay = 300 * this._reelIndex;

			if ((now - this._stopRequestedTime) >= delay && this._isAligned()) {
				const randomIndex = Math.floor(Math.random() * this.symbols.length);
				const slotSymbol =  this._symbolNodes[1].getComponent(SlotSymbol);
				slotSymbol.setIcon(this.symbols[randomIndex], this.symbols[randomIndex]);
				console.log(`🛑 Reel ${this._reelIndex} stopping now At ...${this.symbols[randomIndex].name}`);
				this._isSpinning = false;
				this._pendingStop = false;

				if (this._onStopCallback) {
					this._onStopCallback();
					this._onStopCallback = null;
				}
			}
		}
	}

	private _isAligned(): boolean {
		for (let node of this._symbolNodes) {
			const y = node.getPosition().y;
			const remainder = Math.abs(y % this.symbolSize);

			// Within 1 pixel tolerance
			if (remainder > 1 && remainder < this.symbolSize - 1) {
				return false;
			}
		}
		return true;
	}

	private _wrapSymbols() {
		const bottomLimit = -this.symbolSize * (this.totalRows / 2);

		this._symbolNodes.sort((a, b) => b.position.y - a.position.y);

		let highestY = this._symbolNodes[0].position.y;
		this._topSymbolNode = this._symbolNodes[0];

		for (let i = 0; i < this._symbolNodes.length; i++) {
			const node = this._symbolNodes[i];
			const pos = node.getPosition();

			if (pos.y < bottomLimit) {
				const newY = highestY + this.symbolSize;
				node.setPosition(0, newY, 0);
				highestY = newY;

				const randomIndex = Math.floor(Math.random() * this.symbols.length);
				const slotSymbol = node.getComponent(SlotSymbol);
				slotSymbol.setIcon(this.symbols[randomIndex], this.symbols[randomIndex]);
			}
		}
	}

	private _getSymbolNode(): Node {
		return this._symbolPool.length > 0
			? this._symbolPool.pop()
			: instantiate(this.slotSymbolPrefab);
	}

	private _releaseSymbolNode(node: Node) {
		this._symbolPool.push(node);
	}

	public set reelIndex(value: number) {
		this._reelIndex = value;
	}
}
