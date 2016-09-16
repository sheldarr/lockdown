'use strict';

require('babel-polyfill');
var express = require('express');
var application = express();
var winston = require('winston');
var path = require('path');
var morgan = require('morgan');
var fs = require('fs');
var bodyParser = require('body-parser');
var nconf = require('nconf');
var server = require('http').Server(application);
var io = require('socket.io')(server);
var entitiesRouter = require('./src/routers/entitiesRouter')(io);
var usersRouter = require('./src/routers/usersRouter');
var schedule = require('node-schedule');
var entitiesService = require('./src/services/entitiesService');

nconf.argv().env().file('./config/default.json');

var port = nconf.get('server:port');
var logger = new winston.Logger({
    transports: [new winston.transports.Console(), new winston.transports.File({
        filename: './var/log/server.log'
    })]
});

var apiLogStream = fs.createWriteStream(path.resolve(__dirname, 'var', 'log', 'api.log'), {
    flags: 'a'
});

var allowCrossDomain = function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};

application.use(allowCrossDomain);

application.use(morgan('combined', {
    stream: apiLogStream
}));

application.use(bodyParser.json());

application.use('/bin', express.static(__dirname + '/bin'));
application.use('/public', express.static(__dirname + '/public'));

application.use('/api', entitiesRouter);
application.use('/api', usersRouter);

application.get('*', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

server.listen(port, function () {
    logger.info('PID ' + process.pid + ' Server is running on port: ' + port);
});

if (nconf.get('unlockAll:enabled')) {
    schedule.scheduleJob(nconf.get('unlockAll:cron'), function(){
        entitiesService.unlockAll(function () {
            logger.info('All entities unlocked');
            io.sockets.emit('unlock-all', {});
        });
    });
}

io.on('connection', function (socket) {
    logger.info('Socket connected: ' + socket.id);
});

io.on('disconenct', function (socket) {
    logger.info('Socket disconnected: ' + socket.id);
});