module.exports = {
  extends: [
    'plugin:@shopify/esnext',
    'plugin:@shopify/react',
    'plugin:@shopify/polaris',
    'plugin:@shopify/jest',
    'plugin:@shopify/webpack',
  ],
  rules: {
    'import/no-unresolved': 'off',
  },
  overrides: [
    {
      files: ['*.test.*'],
      rules: {
        'shopify/jsx-no-hardcoded-content': 'off',
      },
    },
  ],
  env: {
    browser: true,
    amd: true,
    node: true,
  },
};
