var path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: [
        'webpack-dev-server/client?http://0.0.0.0:3000',
        "./src/index.js",
     ],
     devServer: {
        inline:true,
        port: 3000
      },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "index_bundle.js"
    },
    module: {
        rules: [
            { 
                test: /\.jsx$|\.es6$|\.js$/, 
                use: "babel-loader",
            },
            { test: /\.css$/, use: ["style-loader", "css-loader"] }
        ]
    },
    mode: "development",
    plugins: [
        new HtmlWebpackPlugin({
            template: "public/index.html"
        })
    ]
};