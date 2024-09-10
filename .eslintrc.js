module.exports = {
	env: {
		browser: true
	},
	extends: ["eslint:recommended"],
	ignorePatterns: [".eslintrc.js", ".old", "dist"],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "import"],
	overrides: [
		{
			files: ["**/*.ts", "**/*.js"],
			extends: [
				"plugin:@typescript-eslint/recommended",
				"plugin:@typescript-eslint/recommended-requiring-type-checking"
			],
			rules: {
				"@typescript-eslint/no-non-null-assertion": "off",
				"@typescript-eslint/no-explicit-any": "off",
				"@typescript-eslint/no-redundant-type-constituents": "off",
				"@typescript-eslint/no-unused-expressions": "off",
				"@typescript-eslint/naming-convention": [
					"error",
					{
						selector: "interface",
						format: ["PascalCase"],
						custom: {
							regex: "^I[A-Z]",
							match: false
						}
					}
				]
			}
		}
	],
	parserOptions: {
		project: ["./tsconfig.json"],
		tsconfigRootDir: __dirname
	},
	settings: {
		"import/resolver": {
			typescript: {}
		}
	},
	root: true
};
