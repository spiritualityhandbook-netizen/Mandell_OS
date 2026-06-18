/** ESLint flat config for project to support ESLint v9+ */
module.exports = [
  {
    ignores: ['node_modules', '.audit_temp', '.audit_temp_test', '.test_temp', '.test_memory_temp'],
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
