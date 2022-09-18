import { babel } from "@rollup/plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default {
	input: "src/main.js",
	output: {
		file: "build/main.min.js",
		format: "iife",
		sourcemap: "inline",
	},

	plugins: [
		resolve({
			jsnext: true,
			main: true,
			browser: true,
		}),
		commonjs(),
		babel({ babelHelpers: "bundled" }),
	],
};
