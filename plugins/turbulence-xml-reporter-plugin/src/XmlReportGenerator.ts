import xml2js = require('xml2js');
import {ReportGenerator} from '../../../src/Reporters/ReportGenerator';
import {HttpRequestRecord} from "../../../src/Steps/Http/HttpRequestRecord";

export class XmlReportGenerator implements ReportGenerator {
    builder;
    results = [];

    constructor() {
        this.builder = new xml2js.Builder();
    }


    addResult(result: HttpRequestRecord): void {
        this.results.push(result);
    }

    end(): void {
        console.log(this.builder.buildObject(this.results));
    }
}