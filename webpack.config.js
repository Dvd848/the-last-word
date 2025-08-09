const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: {
      app: {
        import: './client/src/app.ts'
      }
    },
    watchOptions: {
        aggregateTimeout: 200,
        poll: 1000,
        ignored: /node_modules/,
      },
    output: {
      filename: '[name].bundle.js',
      chunkFilename: '[name].chunk.js',
      path: path.resolve(__dirname, 'client/public/dist')
    },
    optimization: {
      runtimeChunk: 'single',
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: {
              comments: false,
            },
          },
          exclude: /dawg\.bundle\.js/,
          extractComments: false,
        }),
      ],
    },
    devServer: {    
      static: path.join(__dirname, 'client/public'),
        devMiddleware: {
            publicPath: '/client/public/dist/',
            writeToDisk: true,
         },
        port: 8081,
        hot: false
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
    }
  };