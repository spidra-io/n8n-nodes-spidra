module.exports = {
  root: true,
  env: { node: true, es2019: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
  ignorePatterns: ['dist/**', '.eslintrc.js'],
  rules: {
    'no-console': 'warn',
  },
};
