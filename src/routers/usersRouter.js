'use strict';

var express = require('express');
var fs = require('fs');

var usersRouter = new express.Router();

usersRouter.get('/user', function (request, response, next) {
    fs.readFile('./var/data/users.json', 'utf8', function (error, data) {
        if (error) {
            return next(error);
        }

        response.json(JSON.parse(data));
    });
});

module.exports = usersRouter;