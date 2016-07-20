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
            filter = function (entry) {
                return entry.url === name;
            }
        } else {
            filter = function () {
                return true;
            }
        }

        var map = this.requests
            .filter(filter)
            .map(function (entry) {
                return entry.duration;
            });

        var divisor = map.length;

        return map
                .reduce(function (left, right) {
                    return left + right;
                })
            / divisor;

    }

    requestMap() {
        var self = this;
        var map = {};

        this.requests.map(function (entry) {
            if (!map[entry.url]) {
                map[entry.url] = {
                    requests: [],
                    averageResponseTime: function () {
                        return self.averageResponseTime(entry.url);
                    }
                };
            }

            map[entry.url].requests.push(entry);
        });

        return map;
    }

}
