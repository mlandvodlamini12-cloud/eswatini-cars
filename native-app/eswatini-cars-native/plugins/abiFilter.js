// Expo config plugin: limits the APK to arm64-v8a only (95% of phones).
// Reduces APK from ~90MB to ~30MB by excluding arm32, x86, x86_64.
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const content = config.modResults.contents;

      // Add ndk.abiFilters to defaultConfig
      if (!content.includes('abiFilters')) {
        const defaultConfigMatch = content.match(/defaultConfig\s*\{[^}]*versionName[^}]*\}/);
        if (defaultConfigMatch) {
          const oldBlock = defaultConfigMatch[0];
          const newBlock = oldBlock.replace(
            /(\s+)(\})$/,
            "\n        ndk {\n            abiFilters 'arm64-v8a'\n        }\n$1$2"
          );
          config.modResults.contents = content.replace(oldBlock, newBlock);
        }
      }

      // Use release signing config instead of debug
      config.modResults.contents = config.modResults.contents.replace(
        'signingConfig signingConfigs.debug\n            def enableShrinkResources',
        'signingConfig signingConfigs.release\n            def enableShrinkResources'
      );
    }
    return config;
  });
};
