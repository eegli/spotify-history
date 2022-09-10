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
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/explicit-module-boundary-types.md
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    {
      files: ['test/**/*'],
      rules: { '@typescript-eslint/no-empty-function': 'off' },
    },
  ],
};
