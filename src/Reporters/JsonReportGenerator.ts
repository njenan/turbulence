import {ReportGenerator} from './ReportGenerator';
import {HttpRequestRecord} from '../Steps/Http/HttpRequestRecord';

export class JsonReportGenerator implements ReportGenerator {
    results = [];
    metrics = [];
    errors = 0;

    addResult(result: HttpRequestRecord): void {
        this.results.push(result);
    }

    addError() {
        this.errors++;
    }

    addMetric(metric) {
        this.metrics.push(metric);
    }

    averageResponseTime(key?): number {
        return this.results.reduce((duration, request) => {
            return duration + (request.duration / this.results.length);
        }, 0);
    }

    /**
     * @returns {{x: number, y: number}[]}
     */
    responseTimesByTimestamp(): any[] {
        return this.results.map((entry) => {
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
        return this.results.reduce((accum: any, next) => {
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
            x: this.results[0].timestamp,
            y: 0
        }]);
    }

    end(): void {
        // tslint:disable-next-line:no-console
        console.log(JSON.stringify(this.results));
    }
}
