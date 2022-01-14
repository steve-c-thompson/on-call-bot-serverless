const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = (async () => {
    return {
        mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
        devtool: 'eval-source-map',
        entry: slsw.lib.entries,
        externals: [nodeExternals()],
        optimization: {
            nodeEnv: false
        },
        output: {
            libraryTarget: 'commonjs',
            // path: path.join(__dirname, '.webpack'),
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        target: 'node',
        module: {
            rules: [
                {
                    test: /\.(tsx?)$/,
                    loader: 'ts-loader',
                    include: path.resolve(__dirname, 'src'),
                    exclude: [
                        [
                            path.resolve(__dirname, 'node_modules'),
                            path.resolve(__dirname, '.serverless'),
                            path.resolve(__dirname, '.webpack'),
                        ],
                    ],
                    options: {
                        transpileOnly: true,
                        experimentalWatchApi: true,
                    },
                },
            ],
        },
    }
})();