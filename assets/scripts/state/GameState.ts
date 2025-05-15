// state/GameState.ts
import {BaseState} from './BaseState';
import {StateMachine} from './StateMachine';
import {UIUtil} from "db://assets/scripts/utils/UIUtilService";
import {GameManager} from "db://assets/scripts/managers/GameManager";


export class GameState extends BaseState {
	private subMachine = new StateMachine();

	async onEnter(): Promise<void> {
		await UIUtil.delay(500);
		GameManager.instance.changeScene('LobbyScene')
		// GameManager.instance.changeScene('GameScene')
	}

	onExit(): void {}

	update(dt: number): void {
		this.subMachine.update(dt);
	}
    setupEventListeners(): void {
    }
}
