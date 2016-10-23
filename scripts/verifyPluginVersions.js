#!/usr/bin/env node

var fs = require('fs');
var parentVersion = require('../package').version;
var directories = fs.readdirSync('plugins/');

var matched = directories.map(function (entry) {
    var version = require('../plugins/' + entry + '/package').version;
    return version;
}).reduce(function (status, pluginVersion) {
    return status && pluginVersion === parentVersion;
}, true);

if (!matched) {
    console.error('Mismatched plugin and parent version.  Execute `npm run set-plugin-versions` to correct.');
    process.exit(-1);
}
