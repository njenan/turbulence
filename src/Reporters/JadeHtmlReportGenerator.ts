/// <reference path="../../typings/main/ambient/jade/index.d.ts" />
/// <reference path="../../typings/main/ambient/node/index.d.ts" />

import Jade = require('jade');

import {ReportGenerator} from "./ReportGenerator";
import {SummaryResults} from "./../Results/SummaryResults";

export class JadeHtmlReportGenerator implements ReportGenerator {

    generator:(locals?:any) => string;
    fs;

    constructor(fileWriter) {
        this.fs = fileWriter;
        this.generator = Jade.compileFile("src/Reporters/JadeReport.jade");
    }


    toReport(results:SummaryResults) {
        var requests = results.requests.reduce(function (map, nextRequest) {
            if (!map[nextRequest.url]) {
                map[nextRequest.url] = 0;
            }

            map[nextRequest.url]++;

            return map;
        }, {});

        var array = [];

        for (var k in requests) {
            array.push({
                url: k,
                invocations: requests[k]
            });
        }

        this.fs.writeFile('Report.html', this.generator({
                requests: array
            }),
            function (err, result) {
                console.log(err, result);
            }
        );
    }

}
