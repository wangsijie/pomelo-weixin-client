const path = require('path');

module.exports = {
    entry: './lib/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'pomelo-wexin-client.js',
        library: 'pomelo',
        libraryTarget: "umd"
    }
};