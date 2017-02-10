import Q = require('q');
import {TestStep} from '../TestStep';
import {HttpResponse} from '../../Http/HttpResponse';
import {HttpClient} from '../../Http/HttpClient';
import {Injector} from '../Injector';
import {ReportGenerator} from '../../Reporters/ReportGenerator';

export class AssertHttpResponseStep implements TestStep {
    reporter: ReportGenerator;
    validator: any;
    validatorRaw: string;
    injector = new Injector();
    type: string = 'AssertHttpResponseStep';

    constructor(reporter, validator) {
        this.reporter = reporter;
        this.validator = validator;
        this.validatorRaw = validator.toString();
    }

    execute(http: HttpClient, resp: HttpResponse): Q.Promise<HttpResponse> {
        let args = {args: []};
        let promise = Q.resolve<any>(args);
        promise = this.injector.inject(promise, resp, this.validator);

        return promise
            .then(() => {
                if (this.validator.apply(this, args.args) === false) {
                    this.reporter.addError();
                }
            }).catch(this.reporter.addError.bind(this.reporter))
            .then(() => {
                return resp;
            });
    }
}
