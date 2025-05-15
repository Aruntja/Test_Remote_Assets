import { _decorator, instantiate, Component, Node, Prefab, SpriteFrame, UITransform, Vec3 } from 'cc';
import { EventBus } from '../core/EventBus';
import { BoardTile } from 'db://assets/scripts/ui/BoardTile';

const { ccclass, property } = _decorator;

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

	tilePositions: Vec3[] = [];

	private _tiles: BoardTile[] = [];
	private _glowIndex: number = 0;
	private _glowInterval: number = 0.3;
	private _isGlowing: boolean = false;

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

			const tile = tileNode.getComponent(BoardTile);
			tile.tileIndex = i;

			if (this.iconFrames && this.iconFrames[i]) {
				tile.setIcon(this.iconFrames[i]);
			}

			this._tiles.push(tile);
			if(i == 4 || i == 17){
				tileNode.setScale(1.3,1.3)
				if(i == 17){
					tileNode.getComponent(UITransform).setAnchorPoint(0.4, 0.4)
					tileNode.setScale(1.35,1.35)

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

	public updateTileIcon(index: number, newIcon: SpriteFrame) {
		const tile = this._tiles[index];
		if (tile) {
			tile.setIcon(newIcon);
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
		this._tiles[this._glowIndex].setActiveGlow(true);

		this._glowIndex = (this._glowIndex + 1) % this._tiles.length;

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

	//getters and setters
	public get tileCount(): number {
		return this._tiles.length;
	}

	public get tiles(): BoardTile[] {
		return this._tiles;
	}
}
