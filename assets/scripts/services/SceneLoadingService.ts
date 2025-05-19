import { _decorator, Component, director, instantiate, Node, Prefab, resources } from 'cc';
import {ComponentSingleton} from "db://assets/scripts/core/ComponentSingleton";
const { ccclass, property } = _decorator;

@ccclass('SceneLoadingService')
export class SceneLoadingService extends ComponentSingleton<SceneLoadingService> {

	private loadingScreen: Node | null = null;

	@property(Prefab)
	loadingScreenPrefab: Prefab = null;

	onLoad() {
		SceneLoadingService.instance = this;
		director.addPersistRootNode(this.node);
	}

	public static async loadScene(sceneName: string) {
		if (!SceneLoadingService.instance) {
			console.warn("SceneLoader not initialized.");
			return;
		}

		const self = SceneLoadingService.instance;

		// Show loading screen
		if (!self.loadingScreen && self.loadingScreenPrefab) {
			self.loadingScreen = instantiate(self.loadingScreenPrefab);
			self.node.addChild(self.loadingScreen);
		}

		self.loadingScreen!.active = true;

		// Delay for visual feedback (optional)
		await new Promise(resolve => setTimeout(resolve, 100));

		// Load the scene
		director.loadScene(sceneName, () => {
			// Hide the loading screen after load
			self.loadingScreen!.active = false;
		});
	}
}
