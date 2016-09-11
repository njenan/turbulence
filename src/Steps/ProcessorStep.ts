import {TestStep} from './TestStep';
import Q = require('q');
import {Injector} from './Injector';

export class ProcessorStep implements TestStep {
    func;
    rawFunc;
    type = 'ProcessorStep';
    injector = new Injector();

    constructor(func) {
        this.func = func;
        this.rawFunc = func.toString();
    }

    execute(httpClient, data) {
        return this.injector.inject(Q.resolve({args: []}), data, this.func).then((args) => {
            this.func.apply(this, args.args);
        });
    }
}
