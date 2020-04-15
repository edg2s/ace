module.exports = {
	mode: 'production',
	entry: './index.js',
	output: {
		// Relative to <root>/dist
		filename: '../lib/ace/mode/javascript/eslint.js',
		libraryTarget: 'umd'
	}
};
