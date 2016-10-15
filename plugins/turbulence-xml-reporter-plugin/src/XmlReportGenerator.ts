import xml2js = require('xml2js');
import {ReportGenerator} from '../../../src/Reporters/ReportGenerator';

export class XmlReportGenerator implements ReportGenerator {
    builder;

    constructor() {
        this.builder = new xml2js.Builder();
    }

    toReport(results) {
        console.log(this.builder.buildObject(results));
    }
}