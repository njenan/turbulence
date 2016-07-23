#!/usr/bin/env node

var fs = require('fs');

var argh = require('argh');

var args = argh.argv;


var file = fs.readFileSync(args.argv.pop());

console.log(eval(
    "var T = new require('./src/Turbulence').Turbulence;" +
    "var E = require('./src/Executors/LocalExecutor');" +
    "var R = require('./src/Reporters/JadeHtmlReportGenerator');" +
    "var H = require('./src/Http/UnirestHttpClient');" +
    "var F = require('./src/Reporters/__test__/StubFs');" +
    "var turbulence = new T(new H.UnirestHttpClient(), new E.LocalExecutor(), new R.JadeHtmlReportGenerator(new F.StubFs()));" +
    file)
    .report()
    .then(function (data) {
        console.log(data);
    }).catch(function (err) {
        console.error(err);
    }));