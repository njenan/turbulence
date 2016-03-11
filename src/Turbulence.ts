import {HttpClient} from './HttpClient';
import {HttpResponse} from "./HttpResponse";
import {UserJourney} from "./UserJourney";
import {SummaryResults} from "./SummaryResults";

export class Turbulence {
    http:HttpClient;
    journeys:Array<UserJourney> = [];


    constructor(http) {
        this.http = http;
    };

    startTest() {
        var userJourney = new UserJourney(this);
        this.journeys.push(userJourney);

        return userJourney;
    }

    run(cb) {
        this.journeys
            .reduce(function (lastPromise, nextJourney) {
                return lastPromise.then(function (result) {
                    return nextJourney.run(result);
                });
            }, this.journeys.pop().run(new SummaryResults()))
            .then(function (result) {
                cb(result);
            })
            .catch(function (err) {
                console.error(err);
            });
    }
}