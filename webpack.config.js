// @ts-check
// JSON Schema: https://json.schemastore.org/webpack

const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
	return {
		entry: "./src/textblock.ts",
		mode: argv.mode || "production",
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: "ts-loader",
					exclude: /node_modules|demo/
				}
			]
		},
		resolve: {
			extensions: [".ts", ".js"]
		},
		optimization: {
			minimize: argv.mode === "production",
			minimizer: [new TerserPlugin()]
		},
		output: {
			filename: "textblock.min.js",
			path: __dirname + "/dist"
		}
	};
};
