module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'plugin:security/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'security',
  ],
  rules: {
    'no-console': 'off',
    'consistent-return': 'warn',
    'no-underscore-dangle': 'off',
    'max-len': ['error', { code: 120, ignoreComments: true }],
    'no-param-reassign': ['error', { props: false }],
  },
};
