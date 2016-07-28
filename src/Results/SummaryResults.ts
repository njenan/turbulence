import {HttpRequestRecord} from "../Steps/Http/HttpRequestRecord";
export class SummaryResults {
    errors:number;
    requests:Array<HttpRequestRecord>;

    constructor() {
        this.errors = 0;
        this.requests = [];
    }

    averageResponseTime(name?:string):number {
        var filter;

        if (name) {
            filter = (entry) => {
                return entry.url === name;
            }
        } else {
            filter = () => {
                return true;
            }
        }

        var map = this.requests
            .filter(filter)
            .map((entry) => {
                return entry.duration;
            });

        var divisor = map.length;

        return map
                .reduce((left, right) => {
                    return left + right;
                })
            / divisor;

    }

    responseTimesByTimestamp():any[] {
        return this.requests.map((entry) => {
            return {
                x: entry.timestamp,
                y: entry.duration
            }
        });
    }

    responsesPerInterval(interval):any[] {
        return this.requests.reduce((accum:any, next) => {
            var current = accum.pop();

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

    requestMap() {
        var self = this;
        var map = {};

        this.requests.map((entry) => {
            if (!map[entry.url]) {
                map[entry.url] = {
                    requests: [],
                    averageResponseTime: () => {
                        return self.averageResponseTime(entry.url);
                    }
                };
            }

            map[entry.url].requests.push(entry);
        });

        return map;
    }

}
