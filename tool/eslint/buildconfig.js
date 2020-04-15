const fs = require( 'fs' );
const CLIEngine = require( 'eslint' ).CLIEngine;
const cli = new CLIEngine( {
	configFile: './tool/eslint/config/.eslintrc'
} );
const config = cli.getConfigForFile( 'buildconfig.js' );
delete config.ignorePatterns;

// Delete plugin rules
// TODO: Work out how to load plugins
config.plugins.forEach( ( plugin ) => {
	Object.keys( config.rules ).forEach( ( rule ) => {
		if ( rule.indexOf( plugin + '/' ) === 0 ) {
			delete config.rules[rule];
		}
	} );
} );
delete config.plugins;

fs.writeFileSync( './tool/eslint/dist/builtconfig.json', JSON.stringify( config, null, '\t' ) );
