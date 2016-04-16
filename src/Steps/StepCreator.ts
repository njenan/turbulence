export interface StepCreator {

    loop(times:number):StepCreator;

    if(predicate):StepCreator;

    get(url:String, label?:String):StepCreator;

    pause(time:number):StepCreator;

    assertResponse(predicate):StepCreator;

    expectStatus(code):StepCreator;

}