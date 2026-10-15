/**
 * Extends app.json. Plain-HTTP traffic on Android is allowed only when the
 * build points at an http:// API (local dev); release builds against the
 * https:// API refuse unencrypted connections.
 */
module.exports = ({ config }) => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
  return {
    ...config,
    android: {
      ...config.android,
      usesCleartextTraffic: apiUrl.startsWith('http://'),
    },
  };
};
