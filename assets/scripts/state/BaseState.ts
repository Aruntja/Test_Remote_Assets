// state/BaseState.ts
import {StateMachine} from "db://assets/scripts/state/StateMachine";
import {GameManager} from "db://assets/scripts/managers/GameManager";

export abstract class BaseState {
	constructor(
		protected machine: StateMachine,
		protected gameManager: GameManager
	) {}

	abstract setupEventListeners(): void;
	abstract onEnter(): void;
	abstract onExit(): void;
	update?(deltaTime: number): void;
}
