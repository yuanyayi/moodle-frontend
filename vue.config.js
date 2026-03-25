// vue.config.js
const path = require("path");
const webpack = require("webpack");
const packageJson = require("./package.json");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const GitRevision = new GitRevisionPlugin();
const buildDate = JSON.stringify(new Date().toLocaleString());

function resolve(dir) {
  return path.join(__dirname, dir);
}

function getGitHash() {
  try {
    return GitRevision.version();
  } catch (e) { }
  return "unknown";
}

const vueConfig = {
  configureWebpack: {
    plugins: [
      new webpack.IgnorePlugin({
        contextRegExp: /^\.\/locale$/,
        resourceRegExp: /moment$/,
      }),
      new webpack.DefinePlugin({
        APP_VERSION: `"${packageJson.version}"`,
        GIT_HASH: JSON.stringify(getGitHash()),
        BUILD_DATE: buildDate,
      }),
    ],
    optimization: {
      splitChunks: false
    },
    module: {
      rules: [
        {
          test: /\.(mp3|wav|m4a|ogg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'sounds/[name].[hash:8][ext]'
          }
        }
      ]
    }
  },

  chainWebpack: config => {
    config.resolve.alias.set("@$", resolve("src"));

    const svgRule = config.module.rule("svg");
    config.module.rules.delete("svg");

    config.module
      .rule("svg")
      .oneOf("svg_as_component")
      .resourceQuery(/inline/)
      .test(/\.(svg)(\?.*)?$/)
      .use("babel-loader")
      .loader("babel-loader")
      .end()
      .use("vue-svg-loader")
      .loader("vue-svg-loader")
      .options({
        svgo: {
          plugins: [{ prefixIds: true }, { cleanupIDs: true }, { convertShapeToPath: false }, { convertStyleToAttrs: true }],
        },
      })
      .end()
      .end()
      .oneOf("svg_as_regular")
      .merge(svgRule.toConfig())
      .end();
  },

  css: {
    extract: false, // 将CSS内联到JS中
    loaderOptions: {
      less: {
        modifyVars: {
          // 主色调（会影响主按钮）
          "primary-color": "#057CFB",
          // 按钮相关变量
          "btn-primary-bg": "#057CFB",           // 主按钮背景色
          // 或者覆盖按钮特定的悬浮变量
          "btn-primary-hover-bg": "#1E69FF",
          "btn-primary-hover-border": "#1E69FF",
        },
        javascriptEnabled: true,
      },
    },
  },

  devServer: {
    port: 8000,
    proxy: {
      "/api": {
        target: "http://8.140.52.100:8235",
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },

  productionSourceMap: false,
  lintOnSave: false,
  transpileDependencies: [],
};

module.exports = vueConfig;