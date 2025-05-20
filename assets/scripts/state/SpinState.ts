// state/SpinState.ts
import { BaseState } from './BaseState';
import { EventBus } from '../core/EventBus';
import { GameEvents } from '../events/GameEvents';

export class SpinState extends BaseState {
	onEnterImpl(): void {
		EventBus.emit(GameEvents.SPIN_STARTED);

		setTimeout(() => {
			EventBus.emit(GameEvents.SPIN_FINISHED);
		}, 1500);
	}

	onExitImpl(): void {}

	setupEventListeners(): void {
	}
}
