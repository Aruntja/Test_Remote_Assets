export type NumberTweenTask = {
	startValue: number;
	endValue: number;
	duration: number;
	onUpdate: (value: number) => void;
	onComplete?: () => void;
};