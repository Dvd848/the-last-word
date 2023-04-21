const path = require('path');

module.exports = {
    entry: './src/app.ts',
    watchOptions: {
        aggregateTimeout: 200,
        poll: 1000,
        ignored: /node_modules/,
      },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        static: path.resolve(__dirname),
        devMiddleware: {
            publicPath: '/dist/'
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