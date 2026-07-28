const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.platforms = ['web', 'ios', 'android'];
config.resolver.unstable_enablePackageExports = false;

module.exports = config;