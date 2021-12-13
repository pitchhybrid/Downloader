import { resolve } from 'path';
import {Configuration} from 'webpack';
 
const config: Configuration = {
  mode: "development",
  entry: resolve(__dirname, './src/index.ts'),
  stats:{
    warnings:false,
    cached:false
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.html?$/,
        use: 'html-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js','.json'],
  },
  output: {
    filename: 'bundle.js',
    path: resolve(__dirname, 'dist'),
  },
};

export default config;