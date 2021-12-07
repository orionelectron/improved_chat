import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = path.resolve();
const webpackSettings = {
    
    entry: path.resolve(__dirname, './client/src/index.js'),
    stats: "error-only",
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        "presets": [
                            "@babel/preset-env",
                            ["@babel/preset-react", ]
                        ]
                    }
                }

            },
            
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.png|svg|jpg|gif$/,
                use: ["file-loader"],
            }

        ]
    },
    resolve: {
        extensions: ["*", ".js", ".jsx"],
    },
    output: {
        path: path.resolve(__dirname, "./client/src/dist"),
        filename: "bundle.js"
    },
    plugins: [
        
        new HtmlWebpackPlugin({
            template: "./client/src/index.html"
        })
    ],
    
    devServer: {
        allowedHosts: ['localhost'],
        static: path.resolve(__dirname, "./client/src/dist"),
        hot: true,
        port: 3000,
        proxy: {
            '/socket.io': {
                target: 'http://localhost:4000',
               
            },
        },
    }
};

export default webpackSettings;