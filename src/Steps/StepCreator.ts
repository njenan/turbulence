import {TestStep} from "./TestStep";

export interface IStepCreator {

    loop(times:number):IStepCreator;

    if(predicate):IStepCreator;

    get(url:String):IStepCreator;

    pause(time:number):IStepCreator;

    assertResponse(predicate):IStepCreator;

    expectStatus(code):IStepCreator;

}