import {_decorator, director} from 'cc';
import {StateMachine} from '../state/StateMachine';
import {ComponentSingleton} from '../core/ComponentSingleton';
import {AssetLoader} from "db://assets/scripts/core/AssetLoader";
import {InitState} from "db://assets/scripts/state/InitState";
import {States} from "db://assets/scripts/state/States";
import {MainState} from "db://assets/scripts/state/MainState";
import {GameNetworkHandler} from "db://assets/scripts/network/GameNetworkHandler";
import {EnvConfigProxy} from "db://assets/scripts/env/EnvConfig";

const { ccclass } = _decorator;

@ccclass('GameManager')
export class GameManager extends ComponentSingleton<GameManager> {



    private _initializationComplete: boolean = false;
    private machine = new StateMachine();
    private _assetLoader = new AssetLoader();
    private _gameNetworkHandler = new GameNetworkHandler(this);

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
    public changeScene(name: string) {
        console.log(`[GameManager] Changing scene to: ${name}`);
        director.loadScene(name);
    }


    private _setupEventListeners() {

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

