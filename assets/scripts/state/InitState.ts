import {BaseState} from './BaseState';
import {StateMachine} from './StateMachine';
import {InitAssetsState} from "db://assets/scripts/state/InitAssetsState";
import {States} from "db://assets/scripts/state/States";

export class InitState extends BaseState {
	private subMachine: StateMachine = new StateMachine();

	async onEnter(): Promise<void> {
		await this.gameManager.gameNetworkHandler.requestGameInit();
		this.subMachine.register(States.Loading, new InitAssetsState(this.subMachine, this.gameManager));
		this.subMachine.change(States.Loading);
	}

	onExit() {
		// cleanup
		console.log("Existing AssetsInit State")
	}

	update(dt: number) {
		this.subMachine.update(dt);
	}
    setupEventListeners(): void {
    }
}
