/**
 * An object allowing configuration of average response time criteria for a test.  Returned by the
 * [[Criteria.averageResponseTime]] method
 */
export class AverageResponseTime {

    lessThanTime: number;
    greaterThanTime: number;

    /**
     * Require that the average response times during the test were less than the specified time.
     * @param time The threshold, in milliseconds
     * @returns {AverageResponseTime}
     */
    lessThan(time) {
        if (this.greaterThanTime > time) {
            throw new Error('Cannot set lessThan less than greaterThan');
        }

        this.lessThanTime = time;
        return this;
    }

    /**
     * Require that the average response times during the test were greater than the specified time.
     * @param time The threshold, in milliseconds
     * @returns {AverageResponseTime}
     */
    greaterThan(time) {
        if (this.lessThanTime < time) {
            throw new Error('Cannot set greaterThan greater than lessThan');
        }

        this.greaterThanTime = time;
        return this;
    }
}
