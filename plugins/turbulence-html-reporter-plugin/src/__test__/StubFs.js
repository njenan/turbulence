"use strict";
var fs = require('fs');
var StubFs = (function () {
    function StubFs() {
    }
    StubFs.prototype.writeFile = function (path, data, callback) {
        this.path = path;
        this.data = data;
        this.callback = callback;
        fs.writeFile(path, data, function () {
            //console.error('You should disable this fs writing in StubFs.ts');
        });
    };
    return StubFs;
}());
exports.StubFs = StubFs;
