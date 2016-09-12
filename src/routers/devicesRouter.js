const express = require('express');
const fs = require('fs');

module.exports = (io) => {
    const devicesRouter = new express.Router();

    devicesRouter.get('/device', (request, response, next) => {
        fs.readFile('./var/data/devices.json', 'utf8', (error, data) => {
            if (error) {
                return next(error);
            }

            response.json(JSON.parse(data));
        });
    });

    devicesRouter.put('/device/:deviceId', (request, response, next) => {
        fs.readFile('./var/data/devices.json', 'utf8', (error, data) => {
            if (error) {
                return next(error);
            }

            const devices = JSON.parse(data);

            const device = devices.find((device) => {
                return device.id === Number(request.params.deviceId);
            });

            device.lastModifiedBy = request.body.lastModifiedBy;
            device.lastModificationDate = request.body.lastModificationDate
            device.reserved = !device.reserved;

            fs.writeFile('./var/data/devices.json', JSON.stringify(devices));

            const eventName = device.reserved ? 'reservation' : 'release';

            io.sockets.emit(eventName, {
                modifiedBy: request.body.lastModifiedBy,
                modificationDate: request.body.lastModificationDate,
                deviceId: device.id,
                deviceType: device.type
            })

            response.sendStatus(200);
        });
    });

    return devicesRouter;
}