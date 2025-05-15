// state/SpinState.ts
import { BaseState } from './BaseState';
import { EventBus } from '../core/EventBus';
import { GameEvents } from '../events/GameEvents';

export class SpinState extends BaseState {
	onEnter(): void {
		console.log('Spinning...');
		EventBus.emit(GameEvents.SPIN_STARTED);

		setTimeout(() => {
			console.log('Spin finished.');
			EventBus.emit(GameEvents.SPIN_FINISHED);
		}, 1500);
	}

	onExit(): void {}
}
