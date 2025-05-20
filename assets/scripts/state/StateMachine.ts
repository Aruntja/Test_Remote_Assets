// state/StateMachine.ts
import { BaseState } from './BaseState';
import { States } from './States';

export class StateMachine {
	private currentState: BaseState | null = null;
	private states: Map<States, BaseState> = new Map();

	register(key: States, state: BaseState) {
		this.states.set(key, state);
	}

	change(key: States) {
		if (this.currentState) this.currentState.onExit();
		const newState = this.states.get(key);
		if (newState) {
			this.currentState = newState;
			newState.onEnter();
		}
	}

	update(deltaTime: number) {
		this.currentState?.update?.(deltaTime);
	}

	getCurrent(): BaseState | null {
		return this.currentState;
	}

	exit() {
		if (this.currentState) {
			this.currentState.onExit?.();
			this.currentState = null;
		}
	}
}
