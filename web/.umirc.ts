import { defineConfig } from 'umi';

const CompressionPlugin = require('compression-webpack-plugin');

export default defineConfig({
  title: '管理终端',
  hash: true,
  nodeModulesTransform: {
    type: 'none',
  },
  antd: {
    dark: false,
    compact: false,
  },
  request: {
    dataField: '',
  },
  proxy: {
    '/api': {
      target: 'http://localhost:8080/api',
      pathRewrite: { '^/api': '' },
      changeOrigin: true,
    },
    '/static': {
      target: 'http://localhost:8080/static',
      pathRewrite: { '^/static': '' },
      changeOrigin: true,
    },
  },
  chainWebpack: function (config: any) {
    if (process.env.NODE_ENV === 'production') {
      config.plugin('compression-webpack-plugin').use(CompressionPlugin, [
        {
          test: /\.js$|\.html$|\.css$/,
          threshold: 10240,
          deleteOriginalAssets: false,
        },
      ]);
    }
  },
});
