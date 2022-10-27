import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { string } from "rollup-plugin-string";
import image from "@rollup/plugin-image";
import json from "@rollup/plugin-json";

const demoConfig = {
	input: "src/demo/main.ts",
	output: {
		file: "public/main.min.js",
		format: "iife",
		sourcemap: "inline",
	},

	plugins: [
		typescript({
			tsconfig: "tsconfig.demo.json",
		}),
		resolve({
			browser: true,
		}),
		string({
			include: ["**/*.md"],
		}),
		image(),
		json(),
	],
};

const moduleConfig = {
	input: "src/index.ts",
	output: {
		file: "dist/index.js",
		sourcemap: true,
	},

	plugins: [
		typescript(),
		resolve(),
		string({
			include: ["**/*.md"],
		}),
		image(),
		json(),
	],
};

export default function (commandLineArgs) {
	if (commandLineArgs.demo === true) {
		console.log("DEMO!!!");
		return demoConfig;
	}

	return moduleConfig;
}
