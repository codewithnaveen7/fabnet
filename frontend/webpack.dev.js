const { merge } = require("webpack-merge");
const webpack = require("webpack");
const common = require("./webpack.config.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "source-map",
  output: {
    filename: "js/[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
      },
    ],
  },
  devServer: {
    port: 3002,
    historyApiFallback: true,
    hot: true,
    open: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
});
