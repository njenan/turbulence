import {AverageResponseTime} from './AverageResponseTime';
import {BuildBreakerError} from '../BuildBreakerError';

/**
 * Allows criteria to be defined that will fail the test if certain thresholds are violated.  Injected automatically 
 * into the [[TestPlan.breaker]] function.
 */
export class Criteria {
    averageResponseTimeObject;
    predicateFunction;

    /**
     * Configure the average response time object.  Returns an [[AverageResponseTime]] object that allows further
     * configuration.
     * @returns {any}
     */
    averageResponseTime() {
        this.averageResponseTimeObject = new AverageResponseTime();
        return this.averageResponseTimeObject;
    }

    /**
     * A freeform predicate that can evaulate the entire [[SummaryResults]] object that records the executed test plan.
     * The predicate should return either true or false to pass or fail the test respectively.
     * @param func
     */
    predicate(func: (SummaryResults) => boolean) {
        this.predicateFunction = func;
    }

    /**
     * @hidden
     * @param results
     */
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
