export interface StepCreator {

    loop(times:number):StepCreator;

    if(predicate):StepCreator;

    get(url:string, label?:String):StepCreator;

    post(url:string, body:any, label?:String):StepCreator;

    pause(time:number):StepCreator;

    assertResponse(predicate):StepCreator;

    expectStatus(code):StepCreator;

}