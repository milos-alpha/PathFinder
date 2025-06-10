const { mergeConfig } = require('@react-native/metro-config');
const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: [
      ...getDefaultConfig(__dirname).resolver.assetExts, // Include default extensions
      'bin',
      'txt',
      'jpg',
      'png',
      'json',
      'ttf',
      'otf',
      'xml',
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
