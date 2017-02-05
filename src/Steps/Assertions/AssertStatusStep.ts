import Q = require('q');

import {TestStep} from '../TestStep';
import {HttpResponse} from '../../Http/HttpResponse';
import {HttpClient} from '../../Http/HttpClient';
import {ReportGenerator} from '../../Reporters/ReportGenerator';

export class AssertStatusStep implements TestStep {
    reporter: ReportGenerator;
    code: number;
    type: string = 'AssertStatusStep';

    constructor(reporter, code) {
        this.reporter = reporter;
        this.code = code;
    }

    execute(http: HttpClient, resp: HttpResponse): Q.Promise<HttpResponse> {
        if (resp.statusCode !== this.code) {
            this.reporter.addError();
        }

        return Q.resolve(resp);
    }
}
