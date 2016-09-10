import {LocalExecutor} from './Executors/LocalExecutor';
import {TestPlan} from './TestPlan';
import {UnirestHttpClient} from './Http/UnirestHttpClient';

// tslint:disable-next-line:no-var-requires
let Hapi = require('hapi');

export class DistributedTurbulence {
    executor = new LocalExecutor();

    run() {
        let executor = this.executor;
        let server = new Hapi.Server();
        server.connection({port: 7777});
        server.start((err) => {
            if (err) {
                throw err;
            }

            // console.log('Listening for test plans');
        });

        server.route({
            handler: function (request, reply) {
                let testPlans: Array<TestPlan> = request.payload.map((entry) => {
                    return JSON.parse(JSON.stringify(entry), TestPlan.reviver);
                });

                executor.run(testPlans, new UnirestHttpClient()).then((report) => {
                    reply(report);
                });
            },
            method: 'POST',
            path: '/'
        });
    }
}
