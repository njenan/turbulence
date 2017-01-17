import {HttpRequestRecord} from '../Steps/Http/HttpRequestRecord';

/**
 * An object maintaining a record of all responses Turbulence received over the course of a test.
 */
export class SummaryResults {
    errors: number;
    metrics = [];
    requests: Array<HttpRequestRecord>;
    public breakerFunction: (Criteria) => void;

    constructor(breaker) {
        this.breakerFunction = breaker;
        this.errors = 0;
        this.requests = [];
    }

    /**
     * Return the average response time for all requests.
     * @param name TODO what does this do?
     * @returns {number}
     */
    averageResponseTime(name?: string): number {
        let filter;

        if (name) {
            filter = (entry) => {
                return entry.url === name;
            };
        } else {
            filter = () => {
                return true;
            };
        }

        let map = this.requests
            .filter(filter)
            .map((entry) => {
                return entry.duration;
            });

        let divisor = map.length;

        return map
                .reduce((left, right) => {
                    return left + right;
                })
            / divisor;

    }

    /**
     * @returns {{x: number, y: number}[]}
     */
    responseTimesByTimestamp(): any[] {
        return this.requests.map((entry) => {
            return {
                x: entry.timestamp,
                y: entry.duration
            };
        });
    }

    /**
     * 
     * @param interval
     * @returns {any}
     */
    responsesPerInterval(interval): any[] {
        return this.requests.reduce((accum: any, next) => {
            let current = accum.pop();

            if (current.x + interval < next.timestamp) {
                accum.push(current);
                current = {
                    x: current.x + interval,
                    y: 1
                };
            } else {
                current.y++;
            }

            accum.push(current);
            return accum;
        }, [{
            x: this.requests[0].timestamp,
            y: 0
        }]);
    }

    /**
     * 
     * @returns {{}}
     */
    requestMap() {
        let self = this;
        let map = {};

        this.requests.map((entry) => {
            if (!map[entry.url]) {
                map[entry.url] = {
                    averageResponseTime: () => {
                        return self.averageResponseTime(entry.url);
                    },
                    requests: []
                };
            }

            map[entry.url].requests.push(entry);
        });

        return map;
    }

}
