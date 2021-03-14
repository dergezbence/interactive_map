const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'dist/' //puts this as prefix images src tag
    },
    devServer:{
        contentBase: './dist',
        publicPath:"/"  //<- this defines URL component #2 above
   },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/env'],
                        plugins: ['transform-class-properties']
                    }
                }
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "./*.html",
                    to: ".",
                },
                {
                    from: "./kmz/*.kml",
                    to: ".",
                },
                {
                    from: "./images",
                    to: "./images",
                },
            ]})
    ]
}