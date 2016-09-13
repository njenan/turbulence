import Q = require('q');
import {TestStep} from './Steps/TestStep';
import {EmbeddableStepCreator} from './Steps/EmbeddableStepCreator';
import {HttpClient} from './Http/HttpClient';
import {Turbulence} from './Turbulence';
import {SummaryResults} from './Results/SummaryResults';
import {Parent} from './Parent';
import {HttpGetStep} from './Steps/Http/HttpGetStep';
import {PauseStep} from './Steps/PauseStep';
import {LoopStep} from './Steps/Conditionals/LoopStep';
import {IfStep} from './Steps/Conditionals/IfStep';
import {ElseStep} from './Steps/Conditionals/ElseStep';
import {AssertStatusStep} from './Steps/Assertions/AssertStatusStep';
import {AssertHttpResponseStep} from './Steps/Assertions/AssertHttpResponseStep';
import {HttpPutStep} from './Steps/Http/HttpPutStep';
import {HttpPostStep} from './Steps/Http/HttpPostStep';
import {HttpDeleteStep} from './Steps/Http/HttpDeleteStep';
import {HttpHeadStep} from './Steps/Http/HttpHeadStep';
import {ProcessorStep} from './Steps/ProcessorStep';
import {RandomPauseStep} from "./Steps/RandomPauseStep";

export class TestPlan extends EmbeddableStepCreator {

    static reviver(key: string, value: any): any {
        return key === '' ? TestPlan.fromJson(value) : value;
    }

    static fromJson(root) {
        let testPlan = new TestPlan(root.parent, root.name);
        testPlan.results = new SummaryResults();
        let mapStep = (step, parent?): TestStep => {
            switch (step.type) {
                case 'GET':
                    return new HttpGetStep(testPlan.results, step.url, step.headers, step.label);
                case 'HEAD':
                    return new HttpHeadStep(testPlan.results, step.url, step.headers, step.label);
                case 'PUT':
                    return new HttpPutStep(testPlan.results, step.url, step.body, step.headers, step.label);
                case 'POST':
                    return new HttpPostStep(testPlan.results, step.url, step.body, step.headers, step.label);
                case 'DELETE':
                    return new HttpDeleteStep(testPlan.results, step.url, step.headers, step.label);

                case 'AssertStatusStep':
                    return new AssertStatusStep(testPlan.results, step.code);
                case 'AssertHttpResponseStep':
                    // tslint:disable-next-line:no-eval
                    return new AssertHttpResponseStep(testPlan.results, eval('(' + step.validatorRaw + ')'));

                case 'IfStep':
                    // tslint:disable-next-line:no-eval
                    let ifStep = new IfStep(step.parent, testPlan.results, eval('(' + step.predicateRaw + ')'));
                    ifStep.creator.steps = step.creator.steps.map(mapStep);
                    ifStep.elseStep = step.elseStep ? <ElseStep> mapStep(step.elseStep, ifStep) : null;

                    return ifStep;
                case 'ElseStep':
                    let elseStep = new ElseStep(parent ? parent : step.parent, testPlan.results);
                    elseStep.creator.steps = step.creator.steps.map(mapStep);
                    return elseStep;
                case 'LoopStep':
                    let loopStep = new LoopStep(step.parent, testPlan.results, step.times);
                    loopStep.creator.steps = step.creator.steps ? step.creator.steps.map(mapStep) : [];
                    return loopStep;

                case 'ProcessorStep':
                    // tslint:disable-next-line:no-eval
                    return new ProcessorStep(eval('(' + step.rawFunc + ')'));

                case 'PauseStep':
                    return new PauseStep(step.time);
                case 'RandomPauseStep':
                    return new RandomPauseStep(step.lower, step.upper);
            }

            throw new Error('Can\'t deserialize unknown step ' + step.type);
        };
        testPlan.steps = root.steps.map(mapStep);
        testPlan.targetUsers = root.targetUsers;
        testPlan.warmUp = root.warmUp;
        testPlan.time = root.time;
        testPlan.actualUsers = root.actualUsers;
        testPlan.startTime = root.startTime;

        return testPlan;
    }

    parent: Parent<Turbulence>;
    name: String;
    targetUsers: number = 1;
    warmUp: number = 1;
    time: number = -1;
    actualUsers: number = 0;
    startTime: number;

    constructor(parent, name?) {
        super(new SummaryResults());

        this.parent = new Parent(parent);
        this.name = name;
    }

    endUserSteps() {
        return this.parent.value;
    }

    concurrentUsers(users: number) {
        this.targetUsers = users;
        return this;
    }

    rampUpPeriod(seconds: number) {
        this.warmUp = seconds;
        return this;
    }

    duration(millis) {
        this.time = millis;
        return this;
    }

    running() {
        return Date.now() < this.startTime + this.time;
    }

    run(http: HttpClient): Q.Promise<SummaryResults> {
        let self = this;
        let promises = [];

        this.startTime = Date.now();

        let script = (initialPromise) => {
            return this.steps.reduce((nextPromise, nextStep) => {
                return nextPromise.then((data) => {
                    return nextStep.execute(http, data);
                });
            }, initialPromise).then(() => {
                if (this.running()) {
                    return script(initialPromise);
                }
            });
        };

        let rampUpIncrement = this.warmUp / this.targetUsers;

        let startTestPlans = () => {
            let i = 0;
            while (this.actualUsers < this.targetUsers) {
                promises.push(script(Q.resolve(null).delay(rampUpIncrement * i++)));
                this.actualUsers++;
            }
        };

        startTestPlans();

        return Q.all(promises).then(() => {
            return self.results;
        });
    }

}
