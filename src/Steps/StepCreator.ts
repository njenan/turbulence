import {HttpResponse} from "../HttpResponse";
import {TestStep} from "./TestStep";
import {HttpGetStep} from "./HttpGetStep";

export interface StepCreator {
    loop(times:number):StepCreator;

    get(url:String):StepCreator;

    pause(time:number):StepCreator;

    addStep(step:TestStep):void;

    assertResponse(predicate);

}
