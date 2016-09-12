module.exports = {
    entry: './application.jsx',
    output: {
        path: __dirname + '/bin',
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
                presets: ['react', 'es2015']
            }
        }, {
            test: /\.json$/,
            exclude: /node_modules/,
            loader: 'json'
        }]
    }
};
