import {AverageResponseTime} from './AverageResponseTime';
import {BuildBreakerError} from '../BuildBreakerError';

export class Criteria {
    averageResponseTimeObject;
    predicateFunction;

    averageResponseTime() {
        this.averageResponseTimeObject = new AverageResponseTime();
        return this.averageResponseTimeObject;
    }

    predicate(func: (SummaryResults) => boolean) {
        this.predicateFunction = func;
    }

    validate(results) {
        if (this.averageResponseTimeObject) {
            if (this.averageResponseTimeObject.lessThanTime < results.averageResponseTime()) {
                throw new BuildBreakerError('Average response time was greater than '
                    + this.averageResponseTimeObject.lessThanTime + ' ms, failing the build', results);
            }

            if (this.averageResponseTimeObject.greaterThanTime > results.averageResponseTime()) {
                throw new BuildBreakerError('Average response time was less than '
                    + this.averageResponseTimeObject.greaterThanTime + ' ms, failing the build', results);
            }
        }

        if (this.predicateFunction) {
            if (!this.predicateFunction(results)) {
                throw new BuildBreakerError('Predicate evaluated to false', results);
            }
        }
    }
}
