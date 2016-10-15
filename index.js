#!/usr/bin/env node

var Hapi = require('hapi');

var Q = require('q');

var fs = require('fs');
var globule = require('globule');
var argh = require('argh');

var args = argh.argv;
var filenames = args.argv ? args.argv : [];

var Cli = require('./src/Cli').Cli;
var cli = new Cli();

var Plugins = require('./src/Plugins').Plugins;

if (!args.slave) {
    cli.setUpTurbulence(filenames, args).then(run).catch(console.error);

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

        var R = function () {
            var plugins = new Plugins(require('./package.json')).plugins;

            if (plugins.length > 1) {
                console.error('Found multiple plugins of type \'ReportGenerator\' installed in local repo.  ' +
                    'Uninstall duplicate types or specific plugin with --ReportGenerator=PLUGIN_NAME_HERE');
                return;
            }

            if (require('./package.json').dependencies['turbulence-html-reporter-plugin']) {
                return require('turbulence-html-reporter-plugin').main;
            } else {
                return require('./src/Reporters/JsonReportGenerator').JsonReportGenerator;
            }
        }();

        var H = require('./src/Http/UnirestHttpClient').UnirestHttpClient;
        var turbulence = new T(new H(), new E(), new R());
        eval(file)
            .report()
            .then(function () {
            })
            .catch(console.error);
    }
} else {
    var DistributedTurbulence = new require('./src/DistributedTurbulence').DistributedTurbulence;

    var server = new Hapi.Server();
    server.connection({port: 7777});
    server.start(function (err) {
        if (err) {
            throw err;
        }

        console.log('Listening for test plans on port 7777');
    });

    server.route({
        handler: new DistributedTurbulence().route,
        method: 'POST',
        path: '/'
    });
}
