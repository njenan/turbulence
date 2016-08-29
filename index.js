#!/usr/bin/env node

require('./src/Turbulence');
require('./src/Executors/LocalExecutor');
require('./src/Reporters/JadeHtmlReportGenerator');
require('./src/Http/UnirestHttpClient');
require('./src/Reporters/__test__/StubFs');

var fs = require('fs');

var argh = require('argh');

var args = argh.argv;
var filename = args.argv.pop();

if (filename === '{}') {
    var file = '';
    process.stdin.on('readable', function () {
        var chunk = process.stdin.read();
        if (chunk !== null) {
            file += chunk;
        }
    });

    process.stdin.on('end', function () {
        run(file);
    });
} else {
    fs.readFile(filename, function (err, file) {
        if (err) {
            console.error('File \'' + filename + '\' does not exist');
        } else {
            run(file);
        }
    });
}


function run(file) {
    eval(
        "var T = new require('" + __dirname + "/src/Turbulence').Turbulence;" +
        "var E = require('" + __dirname + "/src/Executors/LocalExecutor');" +
        "var R = require('" + __dirname + "/src/Reporters/JadeHtmlReportGenerator');" +
        "var H = require('" + __dirname + "/src/Http/UnirestHttpClient');" +
        "var F = require('" + __dirname + "/src/Reporters/__test__/StubFs');" +
        "var turbulence = new T(new H.UnirestHttpClient(), new E.LocalExecutor(), new R.JadeHtmlReportGenerator(new F.StubFs()));" +
        file)
        .report()
        .then(function () {
        }).catch(function (err) {
        console.error(err);
    });
}