// state/MainState.ts
import { BaseState } from './BaseState';
import { StateMachine } from './StateMachine';
import { GameState } from './GameState';
import {States} from "db://assets/scripts/state/States";

export class MainState extends BaseState {
	private subMachine: StateMachine = new StateMachine();

	onEnter() {
		console.log("Staring Main State")
		this.subMachine.register(States.Game, new GameState(this.subMachine, this.gameManager));
		this.subMachine.change(States.Game);
	}

	onExit() {
		// cleanup
		console.log("Existing Main State")
	}

	update(dt: number) {
		this.subMachine.update(dt);
	}
}
