const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = webpack.container;
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const packageJsonDeps = require("./package.json").dependencies;

const DIST_DIR = path.resolve(__dirname, "dist");
const APP_TEMPLATE = path.resolve(__dirname, "public/index.html");

const sharedDependencies = {
  react: {
    singleton: true,
    eager: true,
    requiredVersion: packageJsonDeps.react,
    strictVersion: false,
  },
  "react-dom": {
    singleton: true,
    eager: true,
    requiredVersion: packageJsonDeps["react-dom"],
    strictVersion: false,
  },
  "react-router-dom": {
    singleton: true,
    eager: true,
    requiredVersion: packageJsonDeps["react-router-dom"],
    strictVersion: false,
  },
  axios: {
    singleton: true,
    requiredVersion: packageJsonDeps.axios,
    strictVersion: false,
  },
  "@tanstack/react-query": {
    singleton: true,
    requiredVersion: packageJsonDeps["@tanstack/react-query"],
    strictVersion: false,
  },
  "@reduxjs/toolkit": {
    singleton: true,
    requiredVersion: packageJsonDeps["@reduxjs/toolkit"],
    strictVersion: false,
  },
  "react-redux": {
    singleton: true,
    requiredVersion: packageJsonDeps["react-redux"],
    strictVersion: false,
  },
};

module.exports = {
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    path: DIST_DIR,
    filename: "js/[name].[contenthash].js",
    publicPath: "/",
    clean: true,
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [DIST_DIR],
      verbose: true,
    }),
    new Dotenv({ systemvars: true }),
    new CaseSensitivePathsPlugin(),
    new ModuleFederationPlugin({
      name: "fabnet",
      remotes: {
        kdesigns: `kdesigns@${process.env.REACT_APP_KDESIGNS_REMOTE_ENTRY_URL}`,
      },
      shared: sharedDependencies,
    }),
    new HtmlWebpackPlugin({
      template: APP_TEMPLATE,
    }),
  ],
};
