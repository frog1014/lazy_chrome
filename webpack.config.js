const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'production',
    devtool: "source-map",
    entry: {
        background: './src/entry/background.js',
        preventClose: './src/entry/prevent_close.js',
        popup: './src/entry/popup.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([{
                from: 'src/assets/images',
                to: 'images'
            },
            {
                from: 'src/assets/css',
                to: 'css'
            },
            {
                from: 'src/_locales',
                to: '_locales'
            },
            {
                from: 'src/manifest.json',
                to: 'manifest.json'
            }
        ]),
        new HtmlWebpackPlugin({
            filename: 'popup.html',
            template: './src/view/popup.html',
            inject: true,
            hash: true,
            chunks: ['popup']
        }),
        new HtmlWebpackPlugin({
            filename: 'prevent_close.html',
            template: './src/view/prevent_close.html',
            inject: true,
            hash: true,
            chunks: ['preventClose']
        }),
    ],
    module: {
        rules: []
    }
};