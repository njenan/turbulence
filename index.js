#!/usr/bin/env node

require('./src/Turbulence');
require('./src/Executors/LocalExecutor');
require('./src/Reporters/JadeHtmlReportGenerator');
require('./src/Http/UnirestHttpClient');
require('./src/Reporters/__test__/StubFs');

var fs = require('fs');
var globule = require('globule');
var argh = require('argh');

var args = argh.argv;
var filenames = args.argv ? args.argv : [];
if (filenames[0] === '{}') {
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
    if (filenames.length === 0) {
        filenames = globule.find('**/*.turbulence');
    } else {
        filenames = filenames.reduce(function (array, next) {
            return array.concat(globule.find(next));
        }, []);
    }

    var errored = false;
    var files = '';
    var x = 0;
    for (var i = 0; i < filenames.length; i++) {
        var name = filenames[i];
        fs.readFile(name, function (err, file) {
            if (err) {
                console.error('File \'' + name + '\' does not exist');
                errored = true;
            } else {
                files += file;
                x++;
                if (x === filenames.length && !errored) {
                    run(files);
                }
            }
        });
    }
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