const express = require('express');
const fs = require('fs');

const usersRouter = new express.Router();

usersRouter.get('/user', (request, response, next) => {
    fs.readFile('./var/data/users.json', 'utf8', (error, data) => {
        if (error) {
            return next(error);
        }

        response.json(JSON.parse(data));
    });
});

module.exports = usersRouter;
