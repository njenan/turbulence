import yaml = require('js-yaml');
import {ReportGenerator} from '../../../src/Reporters/ReportGenerator';
import {HttpRequestRecord} from "../../../src/Steps/Http/HttpRequestRecord";

export class YamlReportGenerator implements ReportGenerator {
    results = [];

    addResult(result: HttpRequestRecord): void {
        this.results.push(result);
    }
    
    addError() {

    }

    addMetric(metric) {

    }

    averageResponseTime() {
        return 0;
    }

    end(): void {
        console.log(yaml.safeDump(this.results, {skipInvalid: true}));
    }
}
