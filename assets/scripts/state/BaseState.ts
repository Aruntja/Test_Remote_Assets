// state/BaseState.ts
import {StateMachine} from "db://assets/scripts/state/StateMachine";
import {GameManager} from "db://assets/scripts/managers/GameManager";

export abstract class BaseState {
	constructor(
		protected machine: StateMachine,
		protected gameManager: GameManager
	) {
		this.setupEventListeners()
	}

	// Logging with hook methods
	onEnter(): void {
		this.onEnterImpl?.();
		console.log(`✅<--------------------- ${this.constructor.name} ---------------------> ✅`);
	}

	onExit(): void {
		this.onExitImpl?.();
		console.log(`❌<--------------------- ${this.constructor.name} ---------------------> ❌`);
	}

	protected onEnterImpl?(): void;
	protected onExitImpl?(): void;

	abstract setupEventListeners(): void;
	update?(deltaTime: number): void;
}
