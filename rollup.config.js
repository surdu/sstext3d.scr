import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { string } from "rollup-plugin-string";

export default {
	input: "src/main.ts",
	output: {
		file: "public/main.min.js",
		format: "iife",
		sourcemap: "inline",
	},

	plugins: [
		typescript(),
		resolve({
			browser: true,
		}),
		string({
      include: "**/*.md",
    })
	],
};
