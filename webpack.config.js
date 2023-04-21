const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: {
      dawg: ['./src/dawg/dawgs.ts', './src/dawg/units.ts', './src/dawg/wrapper.ts'],
      app: {
        import: './src/app.ts',
        dependOn: 'dawg'
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
      path: path.resolve(__dirname, 'dist')
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
        static: path.resolve(__dirname),
        devMiddleware: {
            publicPath: '/dist/',
            writeToDisk: false,
         },
        port: 8080,
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