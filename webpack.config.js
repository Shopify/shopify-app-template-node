const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { DefinePlugin } = require("webpack");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  entry: [path.join(__dirname, "client", "index.js")],
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "index.html"),
    }),
    new DefinePlugin({
      API_KEY: JSON.stringify(process.env.SHOPIFY_API_KEY),
    }),
  ],
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.?jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { corejs: "2", useBuiltIns: "usage" }],
              "@babel/preset-react",
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
