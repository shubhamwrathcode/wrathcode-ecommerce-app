module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Dynamic (state-driven) styles are intentionally inline; static ones live in StyleSheet.
    'react-native/no-inline-styles': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
  },
  ignorePatterns: ['scripts/', 'coverage/'],
};
