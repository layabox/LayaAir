const webpack = require('webpack'); //to access built-in plugins
const path = require('path');

module.exports = {
  entry: './src/debug/Main1.ts',
  mode: 'development',
  module: {
    rules: [
        {
            test: /\.glsl$/,
            loader: 'webpack-glsl-loader'
        },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }      
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }  
};