import authors from "../AUTHORS.md";

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

let authorsIndex = 0;
let prevSecond = -1;

export function developersText() {
	const contributors = authors
		.split("\n")
		.filter((line) => line[0] === "-")
		.map((line) => {
			const regex = /-.\[(.*?)\]/;
			const match = regex.exec(line);

			if (!match) {
				return;
			}

			return match[1];
		});

	const value = contributors[authorsIndex % contributors.length];

	const second = new Date().getSeconds();
	if (second % 10 === 0 && prevSecond !== second) {
		prevSecond = second;
		authorsIndex += 1;
	}

	return value;
}
