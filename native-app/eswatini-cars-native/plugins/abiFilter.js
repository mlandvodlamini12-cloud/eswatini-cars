// Expo config plugin: limits the APK to arm64-v8a only (95% of phones).
// Reduces APK from ~90MB to ~30MB by excluding arm32, x86, x86_64.
// ONLY adds ndk.abiFilters — does NOT touch signing config (EAS handles that).
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const content = config.modResults.contents;

      // Add ndk.abiFilters to defaultConfig if not already present
      if (!content.includes('abiFilters')) {
        // Insert ndk block after the versionName line in defaultConfig
        const updated = content.replace(
          /(\s+versionName\s+"[^"]*")/,
          "$1\n        ndk {\n            abiFilters 'arm64-v8a'\n        }"
        );
        if (updated !== content) {
          config.modResults.contents = updated;
        }
      }
    }
    return config;
  });
};
