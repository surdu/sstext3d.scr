import authors from "../AUTHORS.md";
import { shuffle } from "./utils";

const contributors = authors
	.split("\n")
	.filter((line) => line[0] === "-")
	.map((line) => {
		const regex = /-.\[(.*?)\]/;
		const match = regex.exec(line);

		if (!match) {
			return "";
		}

		return match[1];
	});
shuffle(contributors);

const volcanos = [
	"Hood",
	"Jefferson",
	"Bachelor",
	"Lassen",
	"Broken Top",
	"St. Helens",
	"Three Fingered Jack",
	"Shasta",
	"Thielson",
	"Baker",
	"Adams",
	"Rainier",
	"Garibaldi",
	"Washington",
	"Three Sisters",
	"Glacier",
];
shuffle(volcanos);

export function timeText() {
	const date = new Date();
	return new Intl.DateTimeFormat("default", { timeStyle: "medium" }).format(
		date
	);
}

let rollingIndex = 0;
let prevSecond = -1;

function getRollingText(collection: string[]) {
	const value = collection[rollingIndex % collection.length];

	const second = new Date().getSeconds();
	if (second % 10 === 0 && prevSecond !== second) {
		prevSecond = second;
		rollingIndex += 1;
	}

	return value;
}

export function developersText() {
	return getRollingText(contributors);
}

export function volcanoText() {
	return getRollingText(volcanos);
}