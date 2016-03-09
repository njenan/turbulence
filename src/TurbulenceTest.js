var TurbulenceTest = function (parent) {
    this.parent = parent;
};

TurbulenceTest.prototype.get = function (url) {
    this.url = url;
    return this;
};

TurbulenceTest.prototype.endTest = function () {
    return this.parent;
};

module.exports = TurbulenceTest;