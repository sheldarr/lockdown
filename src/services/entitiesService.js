'use strict';

var fs = require('fs');
var moment = require ('moment');

var entitiesService = {
    unlockAll: function(done) {
        fs.readFile('./var/data/entities.json', 'utf8', function (error, data) {
            var entities = JSON.parse(data);

            var historyEntry = {
                action: "auto-unlock",
                date: moment().format(),
                userId: 0
            };

            entities.forEach(function(entity) {
                entity.history.push(historyEntry);

                entity.history.sort(function(alpha, beta){
                    return new Date(beta.date) - new Date(alpha.date);
                });
                
                entity.locked = false;
            });

            fs.writeFile('./var/data/entities.json', JSON.stringify(entities), done);
        });
    }
}

module.exports = entitiesService