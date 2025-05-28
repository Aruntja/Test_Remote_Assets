// events/GameEvents.ts
export enum GameEvents {
	// Gameplay Events
	START_MAIN_GAME = 'game-started-main',
	END_MAIN_GAME = 'game-ended-main',
	SPIN_STARTED = 'spin-started',
	SPIN_FINISHED = 'spin-finished',
	SHOW_RESULT = 'show-result',

	// Loading Events
	ASSETS_LOADED = 'loaded-assets',
	ON_LOAD_PROGRESS = 'load-progress',

	// Betting Events
	ON_BET_COUNTDOWN_ENDED = 'bet-countdown-ended',
	ON_BET_AMOUNT_UPDATED = 'bet-amount-updated',

	// Network Events
	ON_API_ERROR = 'api-error',
	SOCKET_CONNECTED = 'socket-connected',
	SOCKET_DISCONNECTED = 'socket-disconnected',
	SOCKET_ERROR = 'socket-error',
	SOCKET_RECONNECTING = 'socket-reconnecting',
	NETWORK_INIT_FAILED = 'network-init-failed',
	NETWORK_STATUS_CHANGED = 'network-status-changed',
	NETWORK_RECONNECT_FAILED = 'network-reconnect-failed',
	QUEUE_SOCKET_MESSAGE = 'queue-socket-message',

	// Authentication Events
	AUTHENTICATION_FAILED = 'authentication-failed',

	// Data Update Events
	PLAYER_DATA_UPDATED = 'player-data-updated',
	GAME_STATE_UPDATED = 'game-state-updated'
}