import yaml = require('js-yaml');
import {ReportGenerator} from '../../../src/Reporters/ReportGenerator';
import {HttpRequestRecord} from "../../../src/Steps/Http/HttpRequestRecord";

export class YamlReportGenerator implements ReportGenerator {
    results = [];

    addResult(result: HttpRequestRecord): void {
        this.results.push(result);
    }

    end(): void {
        console.log(yaml.safeDump(this.results, {skipInvalid: true}));
    }
}
