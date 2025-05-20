import {BaseState} from './BaseState';
import {EventBus} from '../core/EventBus';
import {GameEvents} from '../events/GameEvents';
import {GameManager} from "db://assets/scripts/managers/GameManager";
import {StateMachine} from "db://assets/scripts/state/StateMachine";



export class InitAssetsState extends BaseState {

	private boundCheckForAssetsInit: () => void;

	constructor(machine: StateMachine, gameManager: GameManager) {
		super(machine, gameManager);
		this.boundCheckForAssetsInit = this.onAssetsLoaded.bind(this);
	}

	onEnterImpl(): void {
		this.setupEventListeners()
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
