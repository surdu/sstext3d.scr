export function random(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

export function degreesToRadians(degrees: number) {
	return (degrees * Math.PI) / 180;
}

export function timeText() {
	const date = new Date();
	return new Intl.DateTimeFormat("default", { timeStyle: "medium" }).format(
		date
	);
}
