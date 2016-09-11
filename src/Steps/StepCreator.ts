export interface StepCreator {

    loop(times: number): StepCreator;

    if(predicate): StepCreator;

    get(url: string, label?: String): StepCreator;

    post(url: string, body: any, label?: String): StepCreator;

    put(url: string, body: any, label?: String): StepCreator;

    head(url: string, label?: String): StepCreator;

    delete(url: string, label?: String): StepCreator;

    pause(time: number): StepCreator;

    randomPause(lower: number, upper: number): StepCreator;

    assertResponse(predicate): StepCreator;

    processor(func): StepCreator;

    expectStatus(code): StepCreator;

}
