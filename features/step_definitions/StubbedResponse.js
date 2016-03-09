var StubbedResponse = function (url) {
    this.url = url;
};

StubbedResponse.prototype.thenReturn = function (status, body) {
    this.status = status;
    this.body = body;
};

module.exports = StubbedResponse;