/* eslint-env node */

const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

const makeSassLoader = (isDev, modules = false, sourceMap = true) => [
  isDev ? { loader: "style-loader", options: { sourceMap } } : MiniCssExtractPlugin.loader,
  { loader: "css-loader", options: { modules, sourceMap } },
  { loader: "sass-loader", options: { sourceMap } }
];

module.exports = function(env, argv) {
  const isDev = argv.mode === "development";

  return {
    mode: isDev ? "development" : "production",
    context: path.resolve(__dirname, "src"),
    entry: "./js/main.js",
    cache: true,
    output: {
      path: path.resolve(__dirname, "public"),
      filename: "main.js"
    },
    module: {
      rules: [
        {
          // Only match a single rule
          oneOf: [
            { test: /\.(js|jsx)$/, use: "babel-loader", exclude: /node_modules/ },
            {
              test: /\.svg$/,
              use: { loader: "react-svg-loader" }
            },
            {
              test: /\.module\.(scss|sass)$/,
              use: makeSassLoader(isDev, true, true)
            },
            {
              test: /\.(scss|sass)$/,
              use: makeSassLoader(isDev, false, true)
            },
            //   Ensure that urls in scss are loaded correctly
            {
              test: /\.(eot|ttf|woff|woff2|png|jpg)$/,
              use: {
                loader: "file-loader",
                options: {
                  // Default is node_modules -> _/node_modules, which doesn't work with gh-pages.
                  // Instead, don't use [path], just use a [hash] to make file paths unique.
                  name: "static/[name].[hash:8].[ext]"
                }
              }
            },
            // Allow shaders to be loaded via glslify
            { test: /\.(glsl|frag|vert)$/, use: ["raw-loader", "glslify"] }
          ]
        }
      ]
    },
    plugins: [
      new HTMLWebpackPlugin({ template: "./index.html" }),

      new MiniCssExtractPlugin({ filename: "[name].[hash].css", chunkFilename: "[id].[hash].css" }),

      // Instead of using imports & file loader for Phaser assets, just copy over all resources
      new CopyWebpackPlugin([
        {
          from: "./resources",
          to: "resources/",
          ignore: ["atlases/assets/**/*", "**/*.tps"]
        }
      ]),

      new webpack.DefinePlugin({
        "typeof CANVAS_RENDERER": JSON.stringify(true),
        "typeof WEBGL_RENDERER": JSON.stringify(true),
        "typeof EXPERIMENTAL": JSON.stringify(false),
        "typeof PLUGIN_CAMERA3D": JSON.stringify(false),
        "typeof PLUGIN_FBINSTANT": JSON.stringify(false),
        IS_PRODUCTION: !isDev,
        IS_DEVELOPMENT: isDev
      })
    ],
    devtool: isDev ? "eval-source-map" : "source-map"
  };
};
