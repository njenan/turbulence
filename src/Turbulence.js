var TurbulenceTest = require('./TurbulenceTest');

var Turbulence = function (http) {
    this.http = http;
    this.tests = [];
    this.status = {
        inProgress: false
    };
};

Turbulence.prototype.startTest = function () {
    var test = new TurbulenceTest(this);
    this.tests.push(test);
    return test;
};

Turbulence.prototype.run = function () {
    var self = this;

    this.status.inProgress = true;
    this.tests.forEach(function (test) {
        self.http
            .get(test.url)
            .then(function (data) {

            })
            .catch(function (err) {

            });
    });
};

module.exports = Turbulence;
