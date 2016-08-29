import Q = require('q');
import {TestStep} from './TestStep';

export class PauseStep implements TestStep {

    time: number;
    type: string = 'PauseStep';

    constructor(time: number) {
        this.time = time;
    }

    execute() {
        return Q.resolve(null).delay(this.time);
    }
}
