import { _decorator, instantiate, Component, tween, v3, Prefab, SpriteFrame, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import { EventBus } from '../core/EventBus';
import { BoardTile } from 'db://assets/scripts/ui/BoardTile';
import {BoardManager} from "db://assets/scripts/managers/BoardManager";
import {MarqueeSymbolConfig} from "db://assets/scripts/enums/BetOptions";

@ccclass('MarqueeRing')
export class MarqueeRing extends Component {

	@property(Prefab)
	tilePrefab: Prefab = null;

	@property
	rows: number = 6;

	@property
	columns: number = 10;

	@property
	tileSpacing: number = 100;

	@property([SpriteFrame])
	iconFrames: SpriteFrame[] = [];

	@property([MarqueeSymbolConfig])
	iconFrames1: MarqueeSymbolConfig[] = [];

	tilePositions: Vec3[] = [];

	private _boardManager: BoardManager = null

	private _tiles: BoardTile[] = [];
	private _glowIndex: number = 0;
	private _glowInterval: number = 0.3;
	private _isGlowing: boolean = false;
	private _targetIndex: number = null;

	async start() {
	}

	public async createBoardTiles(): Promise<void> {
		this._tiles = [];
		this.node.removeAllChildren();

		const containerTransform = this.node.getComponent(UITransform);
		const containerWidth = containerTransform.width;
		const containerHeight = containerTransform.height;

		const sampleTile = instantiate(this.tilePrefab);
		const tileTransform = sampleTile.getComponent(UITransform);
		const tileWidth = tileTransform.width;
		const tileHeight = tileTransform.height;
		sampleTile.destroy();

		const usableWidth = containerWidth - tileWidth;
		const usableHeight = containerHeight - tileHeight;

		const positions: Vec3[] = [];

		const horizontalStep = usableWidth / (this.columns - 1);
		const verticalStep = usableHeight / (this.rows - 1);

		const horizontalOffset = 10;

		for (let i = 0; i < this.columns; i++) {
			const baseX = -usableWidth / 2 + i * horizontalStep;
			const adjustedX = this.getAdjustedX(i, 4, baseX, horizontalStep, horizontalOffset, false);

			positions.push(new Vec3(adjustedX, usableHeight / 2.05, 0));
			// positions.push(new Vec3(-usableWidth / 2 + i * horizontalStep, usableHeight /2.05, 0)); // Top

		}
		for (let i = 1; i < this.rows - 1; i++) {
			positions.push(new Vec3(usableWidth / 2 + horizontalOffset, usableHeight / 2 - i * verticalStep, 0)); // Right
		}
		for (let i = this.columns - 1; i >= 0; i--) {
			const baseX = -usableWidth / 2 + i * horizontalStep;
			const adjustedX = this.getAdjustedX(i, 4, baseX, horizontalStep, horizontalOffset, false);
			positions.push(new Vec3(adjustedX, -usableHeight / 2.05, 0));
			// positions.push(new Vec3(-usableWidth / 2 + i * horizontalStep, -usableHeight / 2.05, 0)); // Bottom
		}
		for (let i = 1; i < this.rows - 1; i++) {
			positions.push(new Vec3(-usableWidth / 2 - horizontalOffset, -usableHeight / 2 + i * verticalStep, 0)); // Left
		}

		for (let i = 0; i < positions.length; i++) {
			const tileNode = instantiate(this.tilePrefab);
			this.node.addChild(tileNode);
			tileNode.setPosition(positions[i]);

			const tile: BoardTile = tileNode.getComponent(BoardTile);
			tile.tileIndex = i;

			if (this.iconFrames1 && this.iconFrames1[i]) {
				tile.setData(this.iconFrames1[i]);
			}

			this._tiles.push(tile);
			if(i == 4 || i == 17){
				tileNode.setScale(1.3,1.3)
				if(i == 17){
					tileNode.getComponent(UITransform).setAnchorPoint(0.4, 0.4)
					tileNode.setScale(1.4,1.3)

				}
			}
		}

		this.tilePositions = positions;
		EventBus.emit('board:ready', this._tiles);
	}

	public getAdjustedX(i: number, targetIndex: number, baseX: number, step: number, offset: number, isBottom: boolean): number {
		if(!isBottom){
			if (i < targetIndex) {
				return baseX - offset;
			} else if (i > targetIndex) {
				return baseX + offset;
			}
			return baseX;
		}else{

		}
	}

	public getTile(index: number): BoardTile | null {
		return this._tiles[index] || null;
	}

	public startGlowLoop(): void {
		this._isGlowing = true;
		this._scheduleNextGlow();
	}

	public stopGlowLoop(): void {
		this._isGlowing = false;
		this.unscheduleAllCallbacks();
	}

	public setGlowInterval(newInterval: number): void {
		this._glowInterval = newInterval;
		this.unscheduleAllCallbacks();
		this._scheduleNextGlow();
	}

	private _scheduleNextGlow(): void {
		if (!this._isGlowing || this._tiles.length === 0) return;
		this._tiles.forEach(tile => tile.setActiveGlow(false));
		const tile: BoardTile = this._tiles[this._glowIndex];
		tile.setActiveGlow(true);
		this._glowIndex = (this._glowIndex + 1) % this._tiles.length;
		if(this._boardManager)this._boardManager.updateCurrentTile(tile.betType)
		if(this._targetIndex && this._glowIndex === this._targetIndex) this.stopGlowLoop()
		this.scheduleOnce(() => {
			this._scheduleNextGlow();
		}, this._glowInterval);
	}

	public resetGlow(): void {
		this._tiles.forEach(tile => tile.setActiveGlow(false));
		this._glowIndex = 0;
	}

	public highlightTile(index: number): void {
		this.resetGlow();
		if (this._tiles[index]) {
			this._tiles[index].setActiveGlow(true);
		}
	}
	private _delay(seconds: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, seconds * 1000));
	}
	public async showWin(targetIndex: number): Promise<void> {
		const totalTiles = this._tiles.length;
		targetIndex = (targetIndex + totalTiles) % totalTiles;

		this._isGlowing = false;
		this.unscheduleAllCallbacks();

		const currentIndex = this._glowIndex;
		this.resetGlow();

		// 🔁 Phase 1: Anticipation spin
		const anticipationSteps = 2 * totalTiles + Math.floor(totalTiles / 2);
		let current = currentIndex;

		for (let step = 0; step < anticipationSteps; step++) {
			current = (current + 1) % totalTiles;
			this.updateGlow(current);
			await this._delay(0.05);
		}

		// 🐢 Phase 2: Slow down to target
		const minFinalSteps = 6;
		let neededSteps = (targetIndex - current + totalTiles) % totalTiles;

		if (neededSteps < minFinalSteps) {
			neededSteps += totalTiles; // force one extra full loop to ensure nice slow-down
		}

		for (let step = 0; step < neededSteps; step++) {
			const progress = step / neededSteps;
			const speed = 0.1 + (0.4 * Math.pow(progress, 3)); // cubic ease-out
			current = (current + 1) % totalTiles;
			this.updateGlow(current);
			await this._delay(speed);
		}

		this.highlightTile(targetIndex);
		this._glowIndex = targetIndex;
		this._boardManager.marqueeRingSpinComplete()
	}


	// private getShortestDirection(current: number, target: number, total: number): boolean {
	// 	if (current >= 0 && current <= 8 && target >= 13) return true;
	// 	if (current >= 22 && target <= 8) return true;
	//
	// 	const forwardDist = (target - current + total) % total;
	// 	const backwardDist = (current - target + total) % total;
	// 	console.log(`Direction Check: Current=${current}, Target=${target}, Forward=${forwardDist}, Backward=${backwardDist}, Clockwise=${forwardDist <= backwardDist}`);
	// 	return forwardDist <= backwardDist;
	// }

	// private async animateSelection(
	// 	startIndex: number,
	// 	targetIndex: number,
	// 	totalSteps: number,
	// 	totalTiles: number,
	// 	clockwise: boolean
	// ) {
	// 	let current = startIndex;
	//
	// 	const anticipationSteps = 2 * totalTiles;
	// 	for (let step = 0; step < anticipationSteps; step++) {
	// 		current = (current + 1) % totalTiles;
	// 		this.updateGlow(current);
	// 		await this._delay(0.05);
	// 	}
	//
	// 	const neededSteps = this.calculateSteps(current, targetIndex, totalTiles, clockwise);
	// 	for (let step = 0; step < neededSteps; step++) {
	// 		current = clockwise
	// 			? (current + 1) % totalTiles
	// 			: (current - 1 + totalTiles) % totalTiles;
	//
	// 		const progress = step / neededSteps;
	// 		const speed = 0.1 + (0.4 * Math.pow(progress, 3));
	//
	// 		this.updateGlow(current);
	// 		await this._delay(speed);
	// 	}
	// }

	// private calculateSteps(current: number, target: number, total: number, clockwise: boolean): number {
	// 	return clockwise
	// 		? (target - current + total) % total
	// 		: (current - target + total) % total;
	// }

	private updateGlow(index: number) {
		this.resetGlow();
		const tile = this._tiles[index];
		tile.setActiveGlow(true);
		this._boardManager.updateCurrentTile(tile.betType)

		// Add visual feedback

		// Trail effect: light up current and previous tiles slightly
		const prev1 = (index - 1 + this._tiles.length) % this._tiles.length;
		const prev2 = (index - 2 + this._tiles.length) % this._tiles.length;

		this._tiles[prev2].setGlowOpacity?.(0.2); // If you implement this
		this._tiles[prev1].setGlowOpacity?.(0.5);
		this._tiles[index].setGlowOpacity?.(1.0);

		tween(tile.node)
		.to(0.1, { scale: v3(1.2, 1.2, 1) })
		.to(0.1, { scale: v3(1, 1, 1) })
		.start();
	}


	//getters and setters
	public get tileCount(): number {
		return this._tiles.length;
	}

	public get tiles(): BoardTile[] {
		return this._tiles;
	}
	set boardManager(value: BoardManager) {
		this._boardManager = value;
	}

}
