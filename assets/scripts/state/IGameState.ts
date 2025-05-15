// scripts/states/IGameState.ts
export interface IGameState {
	onEnter(): void;
	onExit(): void;
	update?(deltaTime: number): void;
}
