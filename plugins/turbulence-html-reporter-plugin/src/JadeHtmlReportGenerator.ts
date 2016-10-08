import Jade = require('pug');
import {ReportGenerator} from '../../../src/Reporters/ReportGenerator';
import {SummaryResults} from '../../../src/Results/SummaryResults';

export class JadeHtmlReportGenerator implements ReportGenerator {

    generator: (locals?: any) => string;
    fs;

    constructor(fileWriter) {
        this.fs = fileWriter;
        // Code is synchronous... shouldn't be a problem because this won't execute during the performance test
        this.generator = Jade.compileFile(__dirname + '/JadeReport.jade');
    }

    toReport(results: SummaryResults) {
        let requests = results.requests.reduce((map, nextRequest) => {
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

        this.fs.writeFile('Report.html', this.generator({
                averageResponseTime: results.averageResponseTime(),
                chartjsPath: __dirname + '/chart.js',
                cssPath: __dirname + '/style.css',
                requests: array,
                responseTimesData: results.responseTimesByTimestamp(),
                responsesPerIntervalData: results.responsesPerInterval(1000)
            })
        );
    }

}
