/// <reference path="../../typings/main/ambient/jade/index.d.ts" />

import Jade = require('jade');


import {ReportGenerator} from "./ReportGenerator";
import {SummaryResults} from "./../Results/SummaryResults";

export class JadeHtmlReportGenerator implements ReportGenerator {

    generator:(locals?:any) => string;

    constructor() {
        this.generator = Jade.compileFile("src/Reporters/JadeReport.jade");
    }


    toReport(results:SummaryResults) {
        return this.generator({
            totalRequests: results.requests.length
        });
    }
}