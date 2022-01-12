const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = (async () => {
    return {
        mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
        entry: slsw.lib.entries,
        externals: [nodeExternals()],
        optimization: {
            nodeEnv: false
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
                    exclude: [
                        [
                            path.resolve(__dirname, '.serverless'),
                            path.resolve(__dirname, '.webpack'),
                        ],
                    ],
                },
            ],
        },
    }
})();