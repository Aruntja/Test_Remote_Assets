// events/GameEvents.ts
export enum GameEvents {
	START_MAIN_GAME = 'game-started-main',
	END_MAIN_GAME = 'game-ended-main',
	SPIN_STARTED = 'spin-started',
	SPIN_FINISHED = 'spin-finished',
	SHOW_RESULT = 'show-result',
	ASSETS_LOADED = 'loaded-assets',
	ON_LOAD_PROGRESS = 'load-progress',
	ON_BET_COUNTDOWN_ENDED = 'bet-countdown-ended',
}
