import {Turbulence} from "./Turbulence";
import {HttpResponse} from "./HttpResponse";
import {HttpClient} from "./HttpClient";
import {JourneyStep} from "./JourneyStep";
import {SummaryResults} from "./SummaryResults";
import {ExecutionState} from "./ExecutionState";

export class UserJourney {
    parent:Turbulence;
    steps:Array<JourneyStep>;
    http:HttpClient;

    constructor(parent) {
        this.parent = parent;
        this.http = parent.http;
        this.steps = [];
    }

    get(url) {
        var journeyStep = new JourneyStep(this, url);
        this.steps.unshift(journeyStep);

        return journeyStep;
    }

    endTest() {
        return this.parent;
    }

    run(results:SummaryResults):Q.Promise<SummaryResults> {
        var self = this;

        var firstStep = self.steps.pop();

        return self.steps.reduce(function (promise:Q.Promise<ExecutionState>, nextStep:JourneyStep) {
                return promise
                    .then(function (resp) {
                        return resp.resp
                    })
                    .then(function (resp) {
                        return new ExecutionState(resp, nextStep, results);
                    })
                    .then(self.validateResult);
            },
            this.http.get(firstStep.url)
                .then(function (resp:HttpResponse) {
                    return new ExecutionState(resp, firstStep, results);
                })
                .then(self.validateResult))
            .then(function (state) {
                return state.result;
            });
    }

    validateResult(resp:ExecutionState):ExecutionState {
        if (resp.resp.statusCode > 399 && resp.resp.statusCode !== resp.step.expectedStatusCode) {
            ++resp.result.errors;
        }

        if (resp.step.predicates.length > 0) {
            resp.result.errors = resp.step.predicates.reduce(function (last, next) {
                if (!next(resp.resp)) {
                    ++last;
                }

                return last;
            }, resp.result.errors);
        }

        return resp;

    }
}