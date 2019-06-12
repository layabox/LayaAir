const webpack = require('webpack'); //to access built-in plugins
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: './src/layaAir/Laya3D.ts',
  mode: 'development',
  devtool:'inline-source-map',
  module: {
    rules: [
        {
            test: /.*(.glsl|.vs|.fs)$/,
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
    extensions: [ '.tsx', '.ts', '.js' ],
    plugins: [new TsconfigPathsPlugin({ configFile: "./src/samples/tsconfig.json" })]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }  
};