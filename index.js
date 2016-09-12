const express = require('express');
const application = express();
const winston = require('winston');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const devicesRouter = require('./src/routers/devicesRouter');
const usersRouter = require('./src/routers/usersRouter');
const bodyParser = require('body-parser');

const port = 3030;

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: './var/log/server.log' })
    ]
});

const apiLogStream = fs.createWriteStream(path.resolve(__dirname, 'var', 'log', 'api.log'), {
    flags: 'a'
});

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

application.use(allowCrossDomain);

application.use(morgan('combined', {
    stream: apiLogStream
}));

application.use(morgan());

application.use(bodyParser.json());

application.use('/bin', express.static(__dirname + '/bin'));
application.use('/public', express.static(__dirname + '/public'));

application.use('/api', devicesRouter);
application.use('/api', usersRouter);

application.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

application.listen(port, () => {
    logger.info(`PID ${process.pid} Server is running on port: ${port}`);
});