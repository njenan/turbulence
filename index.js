#!/usr/bin/env node

var Plugins = require('./src/Plugins').Plugins;
var Hapi = require('hapi');
var argh = require('argh');

var package = {plugins: []};

try {
    package = require(process.cwd() + '/package.json');
} catch (e) {
}

var args = argh.argv;
var filenames = args.argv ? args.argv : [];

var Cli = require('./src/Cli').Cli;
var PluginFactory = require('./src/PluginFactory').PluginFactory;

var plugins = new Plugins(package);
;

if (!args.slave) {
    var cli = new Cli(args, filenames, new PluginFactory(plugins.plugins));
    cli.execute();
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
