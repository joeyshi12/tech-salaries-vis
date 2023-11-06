const path = require('path');

module.exports = {
    entry: './src/main.ts',
    mode: process.env['NODE_ENV'] === 'production' ? 'production' : 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'docs'),
        },
        compress: true,
        port: 8080,
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'docs')
    }
};
