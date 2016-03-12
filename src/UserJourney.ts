import {Turbulence} from "./Turbulence";
import {HttpResponse} from "./HttpResponse";
import {HttpClient} from "./HttpClient";
import {HttpGetStep} from "./HttpGetStep";
import {SummaryResults} from "./SummaryResults";
import {ExecutionState} from "./ExecutionState";
import {PauseStep} from "./PauseStep";
import {Step} from "./Step";

export class UserJourney {
    parent:Turbulence;
    steps:Array<Step>;
    http:HttpClient;

    constructor(parent) {
        this.parent = parent;
        this.http = parent.http;
        this.steps = [];
    }

    get(url) {
        var journeyStep = new HttpGetStep(this, url, 'GET');
        this.steps.unshift(journeyStep);

        return journeyStep;
    }

    pause(milliseconds:Number) {
        var pauseStep = new PauseStep(milliseconds);
        this.steps.unshift(pauseStep);
        return this;
    }

    endTest() {
        return this.parent;
    }

    run(results:SummaryResults):Q.Promise<SummaryResults> {
        var self = this;
        var firstStep = self.steps.pop();
        var firstStart = new Date();

        return self.steps.reduce(function (promise:Q.Promise<ExecutionState>, nextStep:HttpGetStep) {
                var start = new Date();
                return promise
                    .then(function () {
                        return nextStep.execute();
                    })
                    .then(self.validateResult(nextStep, results, start));
            },
            firstStep.execute()
                .then(self.validateResult(firstStep, results, firstStart)))
            .then(function (state) {
                return state.result;
            });
    }

    validateResult(step, result, start):(resp:HttpResponse) => ExecutionState {
        return function (resp:HttpResponse):ExecutionState {
            var end = new Date();
            var startingErrors = result.errors;

            if (resp) {
                if (resp.statusCode > 399 && resp.statusCode !== step.expectedStatusCode) {
                    ++result.errors;
                }

                if (step.predicates.length > 0) {
                    result.errors = step.predicates.reduce(function (last, next) {
                        if (!next(resp)) {
                            ++last;
                        }

                        return last;
                    }, result.errors);
                }

                result.requests.push({
                    error: startingErrors !== result.errors,
                    url: step.url,
                    type: step.type,
                    status: resp.statusCode,
                    duration: (end.getTime() - start.getTime())
                });
            }

            return new ExecutionState(resp, step, result);
        }
    }
}