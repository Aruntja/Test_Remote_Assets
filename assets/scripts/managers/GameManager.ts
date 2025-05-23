import {_decorator, director, instantiate, Prefab, Node, UIOpacity, tween} from 'cc';
import {StateMachine} from '../state/StateMachine';
import {ComponentSingleton} from '../core/ComponentSingleton';
import {AssetLoader} from "db://assets/scripts/core/AssetLoader";
import {InitState} from "db://assets/scripts/state/InitState";
import {States} from "db://assets/scripts/state/States";
import {GameNetworkHandler} from "db://assets/scripts/network/GameNetworkHandler";
import {EnvConfigProxy} from "db://assets/scripts/env/EnvConfig";
import {EventBus} from "db://assets/scripts/core/EventBus";
import {GameEvents} from "db://assets/scripts/events/GameEvents";
import {BetState} from "db://assets/scripts/state/BetState";
import {GameState} from "db://assets/scripts/state/GameState";
import {UIUtil} from "db://assets/scripts/utils/UIUtilService";
import {ErrorPopUpService} from "db://assets/scripts/ui/Services/ErrorPopUpService";

const { ccclass,property } = _decorator;

@ccclass('GameManager')
export class GameManager extends ComponentSingleton<GameManager> {



    private _initializationComplete: boolean = false;
    private machine = new StateMachine();
    private _assetLoader = new AssetLoader();
    private _gameNetworkHandler = new GameNetworkHandler(this);
    private _errorPopupService: ErrorPopUpService = null;

    private _loadingScreen: Node | null = null;
    private _errorPopup: Node | null = null;

    @property ({type: Prefab})
    loadingScreenPrefab: Prefab | null = null;

    @property ({type: Prefab})
    ErrorPopUpPrefab: Prefab | null = null;

    onLoad() {
        super.onLoad();
        director.addPersistRootNode(this.node);
    }
    async start(){
        console.log('GameManager is ready');
        await this._performInitialSetup()

    }
    private async _performInitialSetup(): Promise<void> {
        try {
            this._registerStates();
            this._setupEventListeners();
            await EnvConfigProxy.loadConfig()
            this.machine.change(States.Init);
        } catch (error) {
            console.error("Initialization failed:", error);
            this._initializationComplete = false;
        }
    }

    startBetState(){
        if(this.initializationComplete) {
            this.machine.change(States.Bet)
        } else if(this._gameNetworkHandler.initError) {
            this.__showErrorPopUp(this._gameNetworkHandler.errorDataMap['init'])
        }
    }
    update(dt: number) {
        this.machine.update(dt);
    }
    public async changeScene(name: string) {
        director.loadScene(name);
    }
    private _setupEventListeners() {
        EventBus.on(GameEvents.ON_BET_COUNTDOWN_ENDED, this.onCountDownTimerEnded, this)
        EventBus.on(GameEvents.ON_BET_COUNTDOWN_ENDED, this.onCountDownTimerEnded, this)
        EventBus.on(GameEvents.ON_API_ERROR, this.__showErrorPopUp, this)
    }
    private _registerStates() {
        this.machine.register(States.Init, new InitState(this.machine, this));
        this.machine.register(States.Game, new GameState(this.machine, this));
        this.machine.register(States.Bet, new BetState(this.machine, this));
    }

    private async onCountDownTimerEnded(){
        // this.machine.change(States.Game)
    }

    async _showLoadingScreen() {
        if (!this._loadingScreen && this.loadingScreenPrefab) {
            this._loadingScreen = instantiate(this.loadingScreenPrefab);
            const scene = director.getScene();
            if (scene && this._loadingScreen) {
                scene.addChild(this._loadingScreen);
                director.addPersistRootNode(this._loadingScreen);
                console.log('Loading screen added to scene');
            }
        }
        UIUtil._fadeIn(this._loadingScreen, 0.3)
    }

    async _hideLoadingScreen() {
        if (!this._loadingScreen) return;
        UIUtil._fadeOut(this._loadingScreen, 0.3);
    }


    private async __showErrorPopUp(error: any) {
        if (!this._errorPopup && this.ErrorPopUpPrefab) {
            this._errorPopup = instantiate(this.ErrorPopUpPrefab);
            director.getScene().addChild(this._errorPopup);
            director.addPersistRootNode(this._errorPopup);
            if(!this._errorPopupService) this._errorPopupService = this._errorPopup.getComponent(ErrorPopUpService);
        }
        if(this._errorPopup) UIUtil._fadeIn(this._errorPopup, 0.3)
        if(this._errorPopupService) this._errorPopupService.showPopUp(error)
    }

    //Getters & setters
    set initializationComplete(value: boolean) {
        this._initializationComplete = value;
    }
    get gameNetworkHandler(): GameNetworkHandler {
        return this._gameNetworkHandler;
    }

    get assetLoader(): AssetLoader {
        return this._assetLoader;
    }
    get initializationComplete(): boolean {
        return this._initializationComplete;
    }

}

