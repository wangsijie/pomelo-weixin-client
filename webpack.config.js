const path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'pomelo-wexin-client.js',
        library: 'pomelo',
        libraryTarget: "umd"
    }
};