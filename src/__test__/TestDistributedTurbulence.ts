import assert = require('power-assert');
import Q = require('q');
import {DistributedTurbulence} from '../DistributedTurbulence';
import {StubFs} from '../Reporters/__test__/StubFs';
import {StubHttpClient} from '../Http/__test__/StubHttpClient';
import {Turbulence} from '../Turbulence';
import {RemoteExecutor} from '../Executors/RemoteExecutor';
import {JadeHtmlReportGenerator} from '../Reporters/JadeHtmlReportGenerator';
import {LocalExecutor} from '../Executors/LocalExecutor';
import {HttpResponse} from '../Http/HttpResponse';

describe('Distributed Turbulence', () => {
    let turbulence;
    let http;
    let stubFs;

    let distributed;
    let request;
    let reply;

    beforeEach(() => {
        stubFs = new StubFs();
        http = new StubHttpClient();
        turbulence = new Turbulence(http, new RemoteExecutor(), new JadeHtmlReportGenerator(stubFs));

        distributed = new DistributedTurbulence(new LocalExecutor(), http);
        request = {};

        let deferred = Q.defer();

        reply = (chunk) => {
            deferred.resolve(chunk);
        };
        reply.then = (func) => {
            return deferred.promise.then(func);
        };
    });

    it('should report results', () => {
        http.whenGet('http://localhost:8080/endpointa').thenReturn(new HttpResponse({
            field: 'alpha'
        }));

        request.payload = [
            turbulence.startUserSteps()
                .get('http://localhost:8080/endpointa')
                .assertResponse((Response) => {
                    return 'alpha' === Response.rawBody.field;
                })
                .endUserSteps().testPlans.pop()
        ];

        distributed.route(request, reply);

        return reply.then((data) => {
            assert.equal(0, data.errors);
        });
    });
});
