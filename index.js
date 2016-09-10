#!/usr/bin/env node

//TODO remember why I did this
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

if (!args.slave) {
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
        if (args.master) {
            if (typeof args.master !== 'string') {
                console.error('Must supply at least 1 slave url');
                return;
            }
        }

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
        var T = new require('./src/Turbulence').Turbulence;

        var E;
        if (args.master) {
            E = function () {
                var RemoteExecutor = require('./src/Executors/RemoteExecutor').RemoteExecutor;
                return new RemoteExecutor(args.master);
            };
        } else {
            E = new require('./src/Executors/LocalExecutor').LocalExecutor;
        }

        var R = require('./src/Reporters/JadeHtmlReportGenerator').JadeHtmlReportGenerator;
        var H = require('./src/Http/UnirestHttpClient').UnirestHttpClient;
        var F = require('./src/Reporters/__test__/StubFs').StubFs;
        var turbulence = new T(new H(), new E(), new R(new F()));
        eval(file)
            .report()
            .then(function () {
            })
            .catch(console.error);
    }
} else {
    var DistributedTurbulence = new require('./src/DistributedTurbulence').DistributedTurbulence;
    new DistributedTurbulence().run();
}
