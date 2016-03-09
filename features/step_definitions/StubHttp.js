var StubbedResponse = require('./StubbedResponse');
var Q = require('q');

var StubHttp = function () {
    this.invocations = {};
    this.gets = {};
    this.deferred;
};

StubHttp.prototype.whenGet = function (url) {
    return this.gets[url] = new StubbedResponse(url);
};

StubHttp.prototype.get = function (url) {
    this.invocations[url] = {count: 1};
    this.deferred = Q.defer();
    return this.deferred.promise;
};

StubHttp.prototype.triggerOneHttpResponse = function () {
    this.deferred.resolve();
};

module.exports = StubHttp;
