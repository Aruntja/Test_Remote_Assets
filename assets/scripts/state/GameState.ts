// state/GameState.ts
import {BaseState} from './BaseState';
import {StateMachine} from './StateMachine';
import {UIUtil} from "db://assets/scripts/utils/UIUtilService";
import {GameManager} from "db://assets/scripts/managers/GameManager";
import {EventBus} from "db://assets/scripts/core/EventBus";
import {GameEvents} from "db://assets/scripts/events/GameEvents";
import {States} from "db://assets/scripts/state/States";
import {BonusGameState} from "db://assets/scripts/state/BonusGameState";


export class GameState extends BaseState {
	private subMachine = new StateMachine();
	private _isBonusGame: boolean = false;
	private boundCheckForBonusGame: () => void;

	constructor(machine: StateMachine, gameManager: GameManager) {
		super(machine, gameManager);
		this.boundCheckForBonusGame = this.checkForBonusGame.bind(this);
	}

	async onEnterImpl(): Promise<void> {
		await this.gameManager._showLoadingScreen();
		await UIUtil.delay(2000);
		await GameManager.instance.changeScene('GameScene');
		await UIUtil.delay(1000);
		await this.gameManager._hideLoadingScreen();
		EventBus.emit(GameEvents.START_MAIN_GAME);
		this.setupEventListeners();
	}

	async onExitImpl(): Promise<void> {
		this.removeEventListeners();
	}

	update(dt: number): void {
		this.subMachine.update(dt);
	}

	setupEventListeners(): void {
		EventBus.on(GameEvents.END_MAIN_GAME, this.boundCheckForBonusGame);
	}

	private removeEventListeners(): void {
		EventBus.off(GameEvents.END_MAIN_GAME, this.boundCheckForBonusGame);
	}

	private async checkForBonusGame() {
		if (this._isBonusGame) {
			this.subMachine.register(States.Bonus, new BonusGameState(this.subMachine, this.gameManager));
			this.subMachine.change(States.Bonus)
		} else {
			await this.gameManager._showLoadingScreen();
			await UIUtil.delay(2000);
			this.gameManager.startBetState();
			await this.gameManager._hideLoadingScreen();
		}
	}
}
