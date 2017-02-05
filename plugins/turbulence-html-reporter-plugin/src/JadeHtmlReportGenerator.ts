import fs = require('fs');
import Jade = require('pug');
import {ReportGenerator} from '../../../src/Reporters/ReportGenerator';
import {JsonReportGenerator} from '../../../src/Reporters/JsonReportGenerator';

export class JadeHtmlReportGenerator implements ReportGenerator {

    generator: (locals?: any) => string;
    reporter = new JsonReportGenerator();

    constructor() {
        // Code is synchronous... shouldn't be a problem because this won't execute during the performance test
        this.generator = Jade.compileFile(__dirname + '/JadeReport.jade');
    }

    addResult(result) {
        this.reporter.addResult(result);
    }

    addMetric(result) {
        this.reporter.addMetric(result);
    }

    addError() {
        this.reporter.addError();
    }

    averageResponseTime() {
        return this.reporter.averageResponseTime();
    }

    end() {
        let requests = this.reporter.results.reduce((map, nextRequest) => {
            let key = nextRequest.url;
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

        let array = [];

        for (let k in requests) {
            let request = requests[k];
            array.push({
                errorRate: request === 0 ? 0 : request.errors / request.invocations,
                invocations: request.invocations,
                name: request.name,
                url: k
            });
        }

        fs.writeFile('Report.html', this.generator({
                averageResponseTime: this.reporter.averageResponseTime(),
                chartjsPath: __dirname + '/chart.js',
                cssPath: __dirname + '/style.css',
                requests: array,
                responseTimesData: this.reporter.responseTimesByTimestamp(),
                responsesPerIntervalData: this.reporter.responsesPerInterval(1000)
            })
        );
    }
}
