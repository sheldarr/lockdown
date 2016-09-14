'use strict';

var express = require('express');
var fs = require('fs');

module.exports = function (io) {
    var devicesRouter = new express.Router();

    devicesRouter.get('/device', function (request, response, next) {
        fs.readFile('./var/data/devices.json', 'utf8', function (error, data) {
            if (error) {
                return next(error);
            }

            response.json(JSON.parse(data));
        });
    });

    devicesRouter.put('/device/:deviceId', function (request, response, next) {
        fs.readFile('./var/data/devices.json', 'utf8', function (error, data) {
            if (error) {
                return next(error);
            }

            var devices = JSON.parse(data);

            var device = devices.find(function (device) {
                return device.id === Number(request.params.deviceId);
            });

            device.lastModifiedBy = request.body.lastModifiedBy;
            device.lastModificationDate = request.body.lastModificationDate;
            device.reserved = !device.reserved;

            fs.writeFile('./var/data/devices.json', JSON.stringify(devices));

            var eventName = device.reserved ? 'reservation' : 'release';

            io.sockets.emit(eventName, {
                deviceName: device.name,
                modifiedBy: request.body.lastModifiedBy,
                modificationDate: request.body.lastModificationDate
            });

            response.sendStatus(200);
        });
    });

    return devicesRouter;
};