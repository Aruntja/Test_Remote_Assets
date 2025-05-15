import {BaseState} from './BaseState';
import {EventBus} from '../core/EventBus';
import {GameEvents} from '../events/GameEvents';
import {GameManager} from "db://assets/scripts/managers/GameManager";



export class InitAssetsState extends BaseState {

	onEnter(): void {
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
			GameManager.instance.startGameState()
		}
	}

	setupEventListeners(): void {
		EventBus.on(GameEvents.ASSETS_LOADED, this.onAssetsLoaded.bind(this))
	}

	onExit(): void {}
}
