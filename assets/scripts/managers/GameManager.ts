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
            this._setupEventListeners();
            await EnvConfigProxy.loadConfig()
            this.machine.register(States.Init, new InitState(this.machine, this));
            this.machine.change(States.Init);
        } catch (error) {
            console.error("Initialization failed:", error);
            this._initializationComplete = false;
        }
    }

    startGameState(){
        if(this.initializationComplete) {
            this.machine.register(States.Main, new MainState(this.machine, this));
            this.machine.change(States.Main)
        }
    }
    update(dt: number) {
        this.machine.update(dt);
    }
    public async changeScene(name: string) {
        // await this._showLoadingScreen();
        // console.log(`[GameManager] Changing scene to: ${name}`);
        await director.loadScene(name);
        // await new Promise(resolve => setTimeout(resolve, 300));
        // this._hideLoadingScreen();
    }
    private _setupEventListeners() {
        EventBus.on(GameEvents.ON_BET_COUNTDOWN_ENDED, this.onCountDownTimerEnded.bind(this))
    }

    private async onCountDownTimerEnded(){
        await this._showLoadingScreen()
        await new Promise(resolve => setTimeout(resolve, 2000));
        this._hideLoadingScreen();
        await this.changeScene('GameScene')
    }

    private async _showLoadingScreen() {

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

    private _hideLoadingScreen() {
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

