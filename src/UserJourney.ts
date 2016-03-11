import Q = require('q');

import {Turbulence} from "./Turbulence";
import {HttpResponse} from "./HttpResponse";
import {HttpClient} from "./HttpClient";

export class UserJourney {
    parent:Turbulence;
    url:String;
    predicates:Array<(resp:HttpResponse) => boolean>;
    expectedStatusCode:Number;
    http:HttpClient;

    constructor(parent) {
        this.parent = parent;
        this.http = parent.http;
        this.predicates = [];
    }

    get(url) {
        this.url = url;
        return this;
    }

    assertResponse(predicate) {
        this.predicates.push(predicate);
        return this;
    }

    expectStatus(code) {
        this.expectedStatusCode = code;
        return this;
    }

    endTest() {
        return this.parent;
    }

    run(lastResult?) {
        var self = this;

        if (!lastResult) {
            lastResult = {
                errors: 0
            };
        }

        return self.http.get(self.url).then(function (resp) {
            if (resp.statusCode > 399 && resp.statusCode !== self.expectedStatusCode) {
                lastResult.errors = 1;
            }

            if (self.predicates.length > 0) {
                lastResult.errors = self.predicates.reduce(function (last, next) {
                    if (!next(resp)) {
                        last++;
                    }

                    return last;
                }, lastResult.errors);
            }

            return {
                errors: lastResult.errors
            };
        }).catch(function (err) {
            console.error(err);
            throw err;
        });
    }
}