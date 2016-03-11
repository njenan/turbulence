"use strict";
var UserJourney_1 = require("./UserJourney");
var Turbulence = (function () {
    function Turbulence(http) {
        this.journeys = [];
        this.http = http;
    }
    ;
    Turbulence.prototype.startTest = function () {
        var userJourney = new UserJourney_1.UserJourney(this);
        this.journeys.push(userJourney);
        return userJourney;
    };
    Turbulence.prototype.run = function (cb) {
        this.journeys
            .reduce(function (lastPromise, nextJourney) {
            return lastPromise.then(function (result) {
                return nextJourney.run(result);
            });
        }, this.journeys.pop().run())
            .then(function (result) {
            cb(result);
        })
            .catch(function (err) {
            console.error(err);
        });
        /*this.journeys.pop().run().then(function (result) {
         cb(result)
         });*/
    };
    return Turbulence;
}());
exports.Turbulence = Turbulence;
