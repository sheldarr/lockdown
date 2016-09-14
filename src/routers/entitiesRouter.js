'use strict';

var express = require('express');
var fs = require('fs');

module.exports = function (io) {
    var entitiesRouter = new express.Router();

    entitiesRouter.get('/entity', function (request, response, next) {
        fs.readFile('./var/data/entities.json', 'utf8', function (error, data) {
            if (error) {
                return next(error);
            }

            response.json(JSON.parse(data));
        });
    });

    entitiesRouter.put('/entity/:entityId', function (request, response, next) {
        fs.readFile('./var/data/entities.json', 'utf8', function (error, data) {
            if (error) {
                return next(error);
            }

            var entities = JSON.parse(data);

            var entity = entities.find(function (entity) {
                return entity.id === Number(request.params.entityId);
            });

            entity.lastModifiedById = Number(request.body.lastModifiedById);
            entity.lastModificationDate = request.body.lastModificationDate;
            entity.locked = !entity.locked;

            fs.writeFile('./var/data/entities.json', JSON.stringify(entities));

            var eventName = entity.locked ? 'lock' : 'unlock';

            io.sockets.emit(eventName, {
                entityName: entity.name,
                modifiedById: request.body.lastModifiedById,
                modificationDate: request.body.lastModificationDate
            });

            response.sendStatus(200);
        });
    });

    return entitiesRouter;
};