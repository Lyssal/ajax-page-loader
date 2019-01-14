var Encore = require('@symfony/webpack-encore');

/**
 * Get the Encore config.
 *
 * @param {string} libraryTarget The output library target
 * @returns {array} The config
 */
function getConfig (libraryTarget) {
  Encore.reset();

  Encore
    .setOutputPath('lib/')
    .setPublicPath('/lib/')
    .addEntry('ajax-page-loader', './src/js/index.js')
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    .disableSingleRuntimeChunk()
    .enableEslintLoader('airbnb')
    .enableSassLoader()
  ;

  var config = Encore.getWebpackConfig();
  config.output = {
    path: __dirname + '/lib',
    filename: `ajax-page-loader.${libraryTarget}.js`,
    library: 'AjaxPageLoader',
    libraryExport: 'default',
    libraryTarget: libraryTarget
  };

  return config;
}

module.exports = [getConfig('commonjs2'), getConfig('amd'), getConfig('umd'), getConfig('var')];
