import yaml = require('js-yaml');
import {ReportGenerator} from '../../../src/Reporters/ReportGenerator';

export class YamlReportGenerator implements ReportGenerator {

    toReport(results) {
        console.log(yaml.safeDump(results));
    }
}
