module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  overrides: [
    {
      files: ['src/**/*'],
      // excludedFiles: '*.test.js',
      rules: {
        quotes: ['error', 'single'],
      },
    },
  ],
};
