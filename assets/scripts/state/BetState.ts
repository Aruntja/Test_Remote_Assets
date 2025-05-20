// state/BetState.ts
import {BaseState} from './BaseState';
import {StateMachine} from './StateMachine';
import {UIUtil} from "db://assets/scripts/utils/UIUtilService";
import {GameManager} from "db://assets/scripts/managers/GameManager";


export class BetState extends BaseState {
	private subMachine = new StateMachine();

	async onEnterImpl(): Promise<void> {
		await UIUtil.delay(500);
		await GameManager.instance.changeScene('LobbyScene')
	}

	onExitImpl(): void {
	}

	update(dt: number): void {
		this.subMachine.update(dt);
	}
    setupEventListeners(): void {
    }
}
