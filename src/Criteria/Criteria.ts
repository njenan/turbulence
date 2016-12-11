import {AverageResponseTime} from './AverageResponseTime';
import {BuildBreakerError} from '../BuildBreakerError';

export class Criteria {
    averageResponseTimeObject;

    averageResponseTime() {
        this.averageResponseTimeObject = new AverageResponseTime();
        return this.averageResponseTimeObject;
    }

    validate(results) {
        throw new BuildBreakerError('Average response time was greater than 50 ms, failing the build', results);
    }
}
