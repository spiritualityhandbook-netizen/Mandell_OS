/** ESLint flat config for project to support ESLint v9+ */
module.exports = [
  {
    // The ignores property is deprecated; it will be removed in favor of inline ignore rules.
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
    },
    plugins: {
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
      'no-console': 'off',
      'prettier/prettier': 'warn',
    },
  },
];
