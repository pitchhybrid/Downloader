import { resolve } from 'path';
import {Configuration} from 'webpack';
 
const config: Configuration = {
  mode: "production",
  entry: resolve(__dirname, './src/index.ts'),
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
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