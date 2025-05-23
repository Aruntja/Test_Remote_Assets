import { _decorator, Component, Node, Prefab, Button,SpriteFrame, instantiate, v3, tween,ScrollView, UITransform } from 'cc';
import {BetChip} from "db://assets/scripts/ui/BetChip";
import {UIUtil} from "db://assets/scripts/utils/UIUtilService";
import {BetChipConfig} from "db://assets/scripts/enums/Miscellaneous";
const { ccclass, property } = _decorator;

@ccclass('BetChipBar')
export class BetChipBar extends Component {

	@property({type: [BetChipConfig]})
	chipTypes: BetChipConfig[] = [];

	@property(Prefab)
	chipPrefab: Prefab = null;

	@property(ScrollView)
	scrollView: ScrollView = null;

	@property(Button)
	btnLeft: Button = null;

	@property(Button)
	btnRight: Button = null;

	@property
	chipSpacing: number = 150;

	@property
	scrollDuration: number = 0.3;

	@property
	selectedScale: number = 1.2;

	private chips: Node[] = [];
	private _selectedIndex: number = 0;
	private content: Node = null;
	private isAnimating: boolean = false;
	private chipSize: any;
	private _chipValues: number[] = [];

	onLoad() {
		this.content = this.scrollView.content;
		this.initializeChips();
		this.updateButtons();
		this.scrollView.node.on('scroll-ended', this.onScrollEnded, this);
		if(this.btnLeft) this.btnLeft.node.on('click', () => this.onClickLeft());
		if(this.btnRight) this.btnRight.node.on('click', () => this.onClickRight());
	}

	initializeChips(){
		this._chipValues = [10, 25, 50, 100, 250, 500];

		this._chipValues.forEach((value, index) => {
			const chipConfig = this.chipTypes.find(config => config.value === value);
			if(!chipConfig){
				console.warn(`Chip config not found for value: ${value}`);
				return;
			}
			const chip = instantiate(this.chipPrefab);
			const betChip : BetChip = chip.getComponent(BetChip);
			betChip.setChipData(chipConfig);
			chip.on(Node.EventType.TOUCH_END, () => this.selectChip(index));

			chip.setPosition(index * this.chipSpacing, 0);
			this.content.addChild(chip);
			this.chips.push(chip);
		});
		this.chipSize = this.chips[0].getComponent(UITransform).width
		this.content.getComponent(UITransform).width = this._chipValues.length * this.chipSpacing;
		this.selectChip(0);
	}

	selectChip(index: number) {
		if (this.isAnimating || index < 0 || index >= this.chips.length) return;

		this._selectedIndex = index;
		this.animateToPosition(index);
		this.updateChipScales();
		// this.chips.forEach((chip, chipIndex) => {
		// 	if(chipIndex == this.selectedIndex){
		// 	}
		// });
	}

	private animateToPosition(index: number){
		this.isAnimating = true;
		let targetX = -index * this.chipSpacing + - this.scrollView.node.getComponent(UITransform).width / 2;
		targetX += this.chipSize * 0.25
		tween(this.content)
		.to(this.scrollDuration, { position: v3(targetX, 0) }, { easing: 'sineOut' })
		.call(() => {
			this.isAnimating = false;
			this.updateButtons();
		})
		.start();
	}

	private updateChipScales() {
		this.chips.forEach((chip: Node, index: number) => {
			const targetScale = index === this._selectedIndex ? this.selectedScale : 1;
			tween(chip)
			.to(0.2,
				{ scale: v3(targetScale, targetScale, 1) }, // Use Vec3 for scale
				{ easing: 'sineOut' }
			)
			.start();
		});
	}

	private onScrollEnded() {
		if (this.isAnimating) return;

		const currentPos = -this.content.x;
		const index = Math.round(currentPos / this.chipSpacing);
		this.selectChip(Math.min(Math.max(index, 0), this.chips.length - 1));
	}

	private updateButtons() {
		this.btnLeft.interactable = this._selectedIndex > 0;
		this.btnRight.interactable = this._selectedIndex < this.chips.length - 1;
	}

	onClickLeft() {
		if (!this.isAnimating && this._selectedIndex > 0) {
			this.selectChip(this._selectedIndex - 1);
			UIUtil.zoomInOut(this.btnLeft.node, this.selectedScale)
		}
	}

	onClickRight() {
		if (!this.isAnimating && this._selectedIndex < this.chips.length - 1) {
			this.selectChip(this._selectedIndex + 1);
			UIUtil.zoomInOut(this.btnRight.node, this.selectedScale)
		}
	}


	//Getters and Setters
	get chipValues(): number[] {
		return this._chipValues;
	}

	set chipValues(value: number[]) {
		this._chipValues = value;
	}
	get selectedIndex(): number {
		return this._selectedIndex;
	}

	set selectedIndex(value: number) {
		this._selectedIndex = value;
	}

	get selectedBetAmount(): number {
		return this._chipValues[this._selectedIndex]
	}

}