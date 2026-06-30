const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const packageJsonDeps = require("./package.json").dependencies;
const { ModuleFederationPlugin } = webpack.container;
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const path = require("path");
const Paths = require("./envConstants");

const isLocalhost = Paths.ENVIRONMENT === "localhost";
// const SRC_DIR = path.resolve(__dirname, './src');
// const ENTRY_POINT = path.resolve(SRC_DIR, './index.js');
const DIST_DIR = path.resolve(__dirname, "./dist");
const APP_TEMPLATE = path.resolve(__dirname, "./public/index.html");

module.exports = {
  //entry: ENTRY_POINT,
  output: {
    path: DIST_DIR,
    filename: "js/[name].bundle.[fullhash].js",
    publicPath: "auto",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts"],
  },
  devServer: {
    port: 3036,
    historyApiFallback: true,
    hot: true,
    open: false,
  },
  mode: "development",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
          test: /\.scss$/,
          exclude: /\.module\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "sass-loader",
            "postcss-loader"
        ]
      },

      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/i, // to import images and fonts
        type: "asset/resource",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "sass-loader","postcss-loader"],
      },
     
      {
        test: /\.module\.scss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[name]__[local]--[hash:base64:5]",
              },
            },
          },
          "sass-loader",
        ],
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
    new CompressionPlugin({
      algorithm: 'gzip', // The compression algorithm to use (gzip/brotli)
      test: /\.(js|css|html|svg)$/, // The file types to compress
      threshold: 10240, // Only assets larger than this size (in bytes) will be compressed
      minRatio: 0.8, // Only assets that compress to a smaller size than this ratio will be compressed
      filename: '[path][base].gz', // The name of the compressed file
    }),
    new ModuleFederationPlugin({
      name: "kdesigns",
      filename: "remoteEntry.js",

      exposes: {
        "./utils": "./src/utils",
        "./Typography": "./src/components/Typography/Typography",
        "./Toast": "./src/components/Toast/index",
        "./kDesignStyle": "./src/styleSheets/css/kdesigns.css",
        "./KDesign": "./src/components/KDesign/index.js",
        "./KContext": "./src/context/index.js",
        "./KHooks": "./src/hooks/index.js",
        './AuthComponent': './src/components/AuthComponent',
       
      },
      shared: {
        ...packageJsonDeps,
        react: {
          singleton: true,
          eager: true,
          requiredVersion: packageJsonDeps.react,
        },
        "react-dom": {
          singleton: true,
          eager: true,
          requiredVersion: packageJsonDeps["react-dom"],
        },
        'react-router-dom': {
          singleton: true,
          eager: true,
          requiredVersion: packageJsonDeps['react-router-dom'],
        },
        axios: { singleton: true, requiredVersion: packageJsonDeps.axios },
      },
    }),
    new HtmlWebpackPlugin({
      template: APP_TEMPLATE,
      verbose: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProgressPlugin({
      activeModules: true,
    }),
  ].concat([new MiniCssExtractPlugin({
    filename: '*./\.(sa|sc|c)ss$/',
    chunkFilename: 'css/[id].css',
  })]),
};
