'use strict';

var fs = require('fs');
var moment = require ('moment');

var entitiesService = {
    unlockAll: function(done) {
        fs.readFile('./var/data/entities.json', 'utf8', function (error, data) {
            var entities = JSON.parse(data);

            entities.forEach(function(entity) {
                entity.lastModifiedById = 0
                entity.lastModificationDate = moment().format();
                entity.locked = false;
            });

            fs.writeFile('./var/data/entities.json', JSON.stringify(entities), done);
        });
    }
}

module.exports = entitiesService