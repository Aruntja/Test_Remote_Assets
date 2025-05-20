import {BaseState} from './BaseState';
import {StateMachine} from './StateMachine';
import {InitAssetsState} from "db://assets/scripts/state/InitAssetsState";
import {States} from "db://assets/scripts/state/States";

export class InitState extends BaseState {
	private subMachine: StateMachine = new StateMachine();

	async onEnterImpl(): Promise<void> {
		await this.gameManager.gameNetworkHandler.requestGameInit();
		this.subMachine.register(States.Loading, new InitAssetsState(this.subMachine, this.gameManager));
		this.subMachine.change(States.Loading);
	}

	onExitImpl() {
		this.subMachine.exit()
		// cleanup
	}

	update(dt: number) {
		this.subMachine.update(dt);
	}
    setupEventListeners(): void {
    }
}
