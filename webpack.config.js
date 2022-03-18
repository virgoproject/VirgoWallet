const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: './background/requires.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'background'),
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    resolve: {
        fallback: {
            assert: require.resolve('assert/'),
            buffer: require.resolve('buffer/'),
            process: require.resolve('process/'),
            crypto: require.resolve("crypto-browserify"),
            url: require.resolve('url/'),
            stream: require.resolve('stream-browserify'),
            http: require.resolve('stream-http'),
            os: require.resolve("os-browserify/browser"),
            https: require.resolve('https-browserify')
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
    ]
};