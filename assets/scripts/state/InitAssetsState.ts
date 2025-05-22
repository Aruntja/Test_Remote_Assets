import {BaseState} from './BaseState';
import {EventBus} from '../core/EventBus';
import {GameEvents} from '../events/GameEvents';
import {GameManager} from "db://assets/scripts/managers/GameManager";
import {StateMachine} from "db://assets/scripts/state/StateMachine";
import {I18nManager} from "db://assets/scripts/managers/I18nManager";
import {GameConfig} from "db://assets/scripts/game/config/GameConfigProxy";



export class InitAssetsState extends BaseState {

	private boundCheckForAssetsInit: () => void;

	constructor(machine: StateMachine, gameManager: GameManager) {
		super(machine, gameManager);
		this.boundCheckForAssetsInit = this.onAssetsLoaded.bind(this);
	}

	async onEnterImpl(): Promise<void> {
		this.setupEventListeners()
		await I18nManager.instance.loadLanguage(GameConfig.language)
		if(GameManager.instance){
			GameManager.instance.assetLoader.initAssets()
		}

	}
	onAssetsLoaded(bundleName: string){
		if(bundleName === 'preloader'){
			GameManager.instance.assetLoader.loadAssets('primary')
		}
		else if(bundleName === 'primary'){
			GameManager.instance.startBetState()
		}
	}

	setupEventListeners(): void {
		EventBus.on(GameEvents.ASSETS_LOADED, this.boundCheckForAssetsInit)
	}

	onExitImpl(): void {
		EventBus.off(GameEvents.ASSETS_LOADED, this.boundCheckForAssetsInit)
	}
}
