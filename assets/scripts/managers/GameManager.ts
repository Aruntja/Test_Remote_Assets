import {_decorator, director, instantiate, Prefab, Node, UIOpacity, tween} from 'cc';
import {StateMachine} from '../state/StateMachine';
import {ComponentSingleton} from '../core/ComponentSingleton';
import {AssetLoader} from "db://assets/scripts/core/AssetLoader";
import {InitState} from "db://assets/scripts/state/InitState";
import {States} from "db://assets/scripts/state/States";
import {MainState} from "db://assets/scripts/state/MainState";
import {GameNetworkHandler} from "db://assets/scripts/network/GameNetworkHandler";
import {EnvConfigProxy} from "db://assets/scripts/env/EnvConfig";
import {EventBus} from "db://assets/scripts/core/EventBus";
import {GameEvents} from "db://assets/scripts/events/GameEvents";
import {BetState} from "db://assets/scripts/state/BetState";
import {GameState} from "db://assets/scripts/state/GameState";

const { ccclass,property } = _decorator;

@ccclass('GameManager')
export class GameManager extends ComponentSingleton<GameManager> {



    private _initializationComplete: boolean = false;
    private machine = new StateMachine();
    private _assetLoader = new AssetLoader();
    private _gameNetworkHandler = new GameNetworkHandler(this);

    private _loadingScreen: Node | null = null;

    @property ({type: Prefab})
    loadingScreenPrefab: Prefab | null = null;

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
        }
    }
    update(dt: number) {
        this.machine.update(dt);
    }
    public async changeScene(name: string) {
        director.loadScene(name);
    }
    private _setupEventListeners() {
        EventBus.on(GameEvents.ON_BET_COUNTDOWN_ENDED, this.onCountDownTimerEnded.bind(this))
    }
    private _registerStates() {
        this.machine.register(States.Init, new InitState(this.machine, this));
        this.machine.register(States.Game, new GameState(this.machine, this));
        this.machine.register(States.Bet, new BetState(this.machine, this));
    }

    private async onCountDownTimerEnded(){
        this.machine.change(States.Game)
    }

    async _showLoadingScreen() {

        if (this.loadingScreenPrefab && !this._loadingScreen) {
            this._loadingScreen = instantiate(this.loadingScreenPrefab);
            director.getScene().addChild(this._loadingScreen);
            director.addPersistRootNode(this._loadingScreen);
        }else{
            const uiOpacity = this._loadingScreen.getComponent(UIOpacity);
            if (uiOpacity) {
                uiOpacity.opacity = 0;
                tween(uiOpacity).to(0.3, { opacity: 255 }).start();
            }
        }
    }

    async _hideLoadingScreen() {
        if (this._loadingScreen) {
            const uiOpacity = this._loadingScreen.getComponent(UIOpacity);
            if (uiOpacity) {
                tween(uiOpacity)
                .to(0.3, { opacity: 0 })
                .call(() => {
                    this._loadingScreen?.destroy();
                    this._loadingScreen = null;
                })
                .start();
            } else {
                this._loadingScreen.destroy();
                this._loadingScreen = null;
            }
        }
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

