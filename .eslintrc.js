module.exports = {
  extends: [
    "plugin:@shopify/react",
    "plugin:@shopify/polaris",
    "plugin:@shopify/jest",
    "plugin:@shopify/webpack",
    "next",
  ],
  rules: {
    "import/no-unresolved": "off",
  },
  overrides: [
    {
      files: ["*.test.*"],
      rules: {
        "shopify/jsx-no-hardcoded-content": "off",
      },
    },
  ],
};
