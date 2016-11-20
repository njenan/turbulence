import assert = require('power-assert');
import Q = require('q');
import {DistributedTurbulence} from '../DistributedTurbulence';
import {StubHttpClient} from '../Http/__test__/StubHttpClient';
import {Turbulence} from '../Turbulence';
import {RemoteExecutor} from '../Executors/RemoteExecutor';
import {LocalExecutor} from '../Executors/LocalExecutor';
import {HttpResponse} from '../Http/HttpResponse';
import {StubReportGenerator} from '../Reporters/__test__/StubReportGenerator';

describe('Distributed Turbulence', () => {
    let turbulence;
    let turbulence2;
    let http;

    let distributed;
    let request;

    beforeEach(() => {
        http = new StubHttpClient();
        turbulence = new Turbulence(http, new RemoteExecutor(), new StubReportGenerator());
        turbulence2 = new Turbulence(http, new RemoteExecutor(), new StubReportGenerator());

        distributed = new DistributedTurbulence(new LocalExecutor(), http);
        request = {};
    });

    function createReply() {
        let deferred = Q.defer();
        let reply;

        reply = (chunk) => {
            deferred.resolve(chunk);
        };
        reply.then = (func) => {
            return deferred.promise.then(func);
        };

        return reply;
    }

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

        let reply = createReply();
        distributed.route(request, reply);

        return reply.then((data) => {
            assert.equal(0, data.errors);
        });
    });

    it('should only run 1 test plan at a time', () => {
        http.whenGet('http://localhost:8080/endpointa').thenReturn(new HttpResponse({
            field: 'alpha'
        }));

        let reply1 = createReply();
        request.payload = [
            turbulence.startUserSteps()
                .get('http://localhost:8080/endpointa')
                .pause(100)
                .assertResponse((Response) => {
                    return 'alpha' === Response.rawBody.field;
                })
                .endUserSteps().testPlans.pop()
        ];
        distributed.route(request, reply1);

        let reply2 = createReply();
        let request2: any = {};
        request2.payload = [
            turbulence2.startUserSteps()
                .get('http://localhost:8080/endpointa')
                .pause(100)
                .assertResponse((Response) => {
                    return 'alpha' === Response.rawBody.field;
                })
                .endUserSteps().testPlans.pop()
        ];
        distributed.route(request2, reply2);

        return reply1.then((data1) => {
            return reply2.then((data2) => {
                let firstTime = data1.requests[0].timestamp;
                let secondTime = data2.requests[0].timestamp;
                assert.ok(secondTime - firstTime > 100);
            });
        });
    });
});
