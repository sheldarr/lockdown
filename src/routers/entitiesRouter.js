'use strict';

var express = require('express');
var fs = require('fs');
var moment = require('moment');

module.exports = function (io) {
    var entitiesRouter = new express.Router();

    entitiesRouter.get('/entity', function (request, response, next) {
        fs.readFile('./var/data/entities.json', 'utf8', function (error, data) {
            if (error) {
                return next(error);
            }

            try {
                return response.json(JSON.parse(data));
            } catch (error) {
                return response.sendStatus(503);
            }
        });
    });

    entitiesRouter.delete('/entity/:entityId', function (request, response, next) {
        fs.readFile('./var/data/entities.json', 'utf8', function (error, data) {
            if (error) {
                return next(error);
            }

            var entities = JSON.parse(data);

            var entity = entities.find(function (entity) {
                return entity.id === Number(request.params.entityId);
            });

            if (!entity) {
                return response.sendStatus(404);
            }

            entities.splice(entities.indexOf(entity), 1);

            fs.writeFile('./var/data/entities.json', JSON.stringify(entities), function () {
                io.sockets.emit("delete", {
                    entityName: entity.name
                });

                response.sendStatus(200);
            });
        });
    });

    entitiesRouter.post('/entity', function (request, response, next) {
        fs.readFile('./var/data/entities.json', 'utf8', function (error, data) {
            if (error) {
                return next(error);
            }

            if (!request.body.entityName) {
                return response.sendStatus(400);
            }

            var entities = JSON.parse(data);

            var nextId = Math.max.apply(Math, entities.map(function(entity) {
                return entity.id;
            })) + 1;

            var entity = {
                "id": nextId,
                "name": request.body.entityName,
                "locked": false,
                "history": [{
                    action: "create",
                    userId: 0,
                    date: moment().format()
                }]
            };

            entities.push(entity);

            fs.writeFile('./var/data/entities.json', JSON.stringify(entities), function () {
                io.sockets.emit("create", {
                    entityName: entity.name
                });

                response.sendStatus(200);
            });
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

            if (!entity) {
                return response.sendStatus(404);
            }

            if (!request.body.userId || !request.body.date) {
                return response.sendStatus(400);
            }

            if (entity.locked && entity.history[0].userId !== Number(request.body.userId)) {
                return response.sendStatus(403);
            }

            entity.locked = !entity.locked;

            var historyEntry = {
                action: entity.locked ? 'lock' : 'unlock',
                date: request.body.date,
                userId: Number(request.body.userId)
            };

            entity.history.push(historyEntry);

            entity.history.sort(function(alpha, beta){
                return new Date(beta.date) - new Date(alpha.date);
            });

            fs.writeFile('./var/data/entities.json', JSON.stringify(entities), function () {
                var eventName = entity.locked ? 'lock' : 'unlock';

                io.sockets.emit(eventName, {
                    entityName: entity.name,
                    userId: historyEntry.userId,
                    date: historyEntry.date
                });

                response.sendStatus(200);
            });
        });
    });

    return entitiesRouter;
};