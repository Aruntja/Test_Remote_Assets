import { _decorator, Component, game } from 'cc';
const { ccclass } = _decorator;

@ccclass('ComponentSingleton')
export abstract class ComponentSingleton<T> extends Component {
	public static instance: any = null;

	onLoad() {
		const clazz = this.constructor as any;
		if (clazz.instance) {
			this.destroy(); // Prevent duplicate
		} else {
			clazz.instance = this;
			game.addPersistRootNode(this.node);
		}
	}
}
