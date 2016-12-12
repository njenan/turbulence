export class AverageResponseTime {

    lessThanTime: number;
    greaterThanTime: number;

    lessThan(time) {
        if (this.greaterThanTime > time) {
            throw new Error('Cannot set lessThan less than greaterThan');
        }

        this.lessThanTime = time;
        return this;
    }

    greaterThan(time) {
        if (this.lessThanTime < time) {
            throw new Error('Cannot set greaterThan greater than lessThan');
        }

        this.greaterThanTime = time;
        return this;
    }
}
