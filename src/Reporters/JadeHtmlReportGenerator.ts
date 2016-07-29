/// <reference path="../../typings/main/ambient/jade/index.d.ts" />
/// <reference path="../../typings/main/ambient/node/index.d.ts" />

import Jade = require('jade');
import fs = require('fs');

import {ReportGenerator} from "./ReportGenerator";
import {SummaryResults} from "./../Results/SummaryResults";


export class JadeHtmlReportGenerator implements ReportGenerator {

    generator:(locals?:any) => string;
    fs;

    constructor(fileWriter) {
        this.fs = fileWriter;
        //Code is synchronous... shouldn't be a problem because this won't execute during the performance test
        this.generator = Jade.compileFile(__dirname + "/JadeReport.jade");
    }


    toReport(results:SummaryResults) {
        var requests = results.requests.reduce((map, nextRequest) => {
            var key = nextRequest.url;
            if (!map[key]) {
                map[key] = {};
                map[key].invocations = 0;
            }

            map[key].invocations++;

            if (!map[key].errors) {
                map[key].errors = 0;
            }

            if (nextRequest.error) {
                map[key].errors++;
            }

            map[key].name = nextRequest.label;

            return map;
        }, {});

        var array = [];

        for (var k in requests) {
            var request = requests[k];
            array.push({
                url: k,
                name: request.name,
                invocations: request.invocations,
                errorRate: request === 0 ? 0 : request.errors / request.invocations
            });
        }

        this.fs.writeFile('Report.html', this.generator({
                requests: array,
                averageResponseTime: results.averageResponseTime(),
                responseTimesData: results.responseTimesByTimestamp(),
                responsesPerIntervalData: results.responsesPerInterval(1000),
                cssPath: __dirname + '/style.css',
                chartjsPath: __dirname + '/chart.js'
            })
        );
    }

}
