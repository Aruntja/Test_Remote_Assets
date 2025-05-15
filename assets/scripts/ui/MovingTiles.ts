import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MovingTileGroup')
export class MovingTileGroup extends Component {
    @property
    speed: number = 100;

    @property
    isVertical: boolean = false;

    private tiles: Node[] = [];
    private tileSize: number;

    start() {
        this.tiles = this.node.children;

        if (this.tiles.length < 2) {
            console.warn('You need at least 2 tiles for seamless scrolling.');
            return;
        }

        const transform = this.tiles[0].getComponent(UITransform);
        this.tileSize = this.isVertical ? transform.height : transform.width - 20;

        // Ensure all tiles are aligned in sequence
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.isVertical) {
                this.tiles[i].setPosition(new Vec3(0, this.tileSize * (this.tiles.length - 1 - i), 0));
            } else {
                this.tiles[i].setPosition(new Vec3(this.tileSize * i, 0, 0));
            }
        }
    }
    update(dt: number) {
        const delta = this.speed * dt;

        for (let i = 0; i < this.tiles.length; i++) {
            const pos = this.tiles[i].position;
            this.tiles[i].setPosition(pos.x - delta, pos.y);
        }

        for (let i = 0; i < this.tiles.length; i++) {
            const tile = this.tiles[i];
            const pos = tile.position;

            if (pos.x <= -this.tileSize * 1.5) {
                let rightMostX = Math.max(...this.tiles.map(t => t.position.x));
                tile.setPosition(rightMostX + this.tileSize, pos.y, pos.z);
            }
        }
    }

}
