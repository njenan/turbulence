/**
 * The common interface that all step creating 'nodes' implement.  These steps will be available when you have just 
 * created a [[TestPlan]], entered an if statement, or started a loop.
 */
export interface StepCreator {

    /**
     * Start a loop for the specified number of times.  Steps can be chained off of this object until
     * [[LoopStep.endLoop]] is called.
     *
     * @param times How many times to execute the contents of the loop.
     * @returns {LoopStep}
     */
    loop(times: number): StepCreator;

    /**
     * Start an [[IfStep]].  An if step evaluates the predicate that is passed in before decided to execute.  If the
     * predicate evaluates to false, the contents of the [[IfStep]] will not execute.
     *
     * @param predicate The predicate to evaluate.  It is passed the result of the last step executed.
     * @returns {IfStep}
     */
    if(predicate): StepCreator;

    /**
     * Make an http GET request to the specified Url.
     *
     * @param url The url to send the request to.
     * @param headers Headers to send, specify them as a js object (e.g. `{ x-header-one: 'SomeValue', x-header-two: 
     * 'OtherValue' }`)
     * @param label A label for this request.  This is shown in the standard Turbulence Html Reporter.  Purely cosmetic.
     * @returns {EmbeddableStepCreator}
     */
    get(url: string, label?: String): StepCreator;

    /**
     * Send an Http POST request to the specified Url.
     *
     * @param url The url to send the request to.
     * @param body The body to post.
     * @param headers Headers to send, specify them as a js object (e.g. `{ x-header-one: 'SomeValue', x-header-two: 
     * 'OtherValue' }`)
     * @param label A label for this request.  This is shown in the standard Turbulence Html Reporter.  Purely cosmetic.
     * @returns {EmbeddableStepCreator}
     */
    post(url: string, body: any, label?: String): StepCreator;

    /**
     *
     * @param url
     * @param body
     * @param headers
     * @param label
     * @returns {EmbeddableStepCreator}
     */
    put(url: string, body: any, label?: String): StepCreator;
    
    /**
     *
     * @param url
     * @param headers
     * @param label
     * @returns {EmbeddableStepCreator}
     */
    head(url: string, label?: String): StepCreator;

    /**
     *
     * @param url
     * @param headers
     * @param label
     * @returns {EmbeddableStepCreator}
     */
    delete(url: string, label?: String): StepCreator;

    /**
     * Pause the test execution for a set number of milliseconds.  Only applies to the current 'user'.
     * @param time The amount of time to pause in milliseconds.
     * @returns {EmbeddableStepCreator}
     */
    pause(time: number): StepCreator;

    /**
     * As [[EmbeddableStepCreator.pause]], except it pauses a random amount of time between the specified lower and
     * upper bonudaries.
     * @param lower The lower boundary in milliseconds
     * @param upper The upper boundary in milliseconds
     * @returns {EmbeddableStepCreator}
     */
    randomPause(lower: number, upper: number): StepCreator;

    /**
     * Allows a predicate to be provided that can make an assertino against the [[HttpResponse]] returned in a previous
     * step and return True or False.
     *
     * @param predicate
     * @returns {EmbeddableStepCreator}
     */
    assertResponse(predicate): StepCreator;

    /**
     *
     * @param func
     * @returns {EmbeddableStepCreator}
     */
    processor(func): StepCreator;

    /**
     * Assert that the Http request returned with the specified status code.  If not, this step will be marked as a
     * failure in the report.
     *
     * @param code The Http status code to expect as a number
     * @returns {EmbeddableStepCreator}
     */
    expectStatus(code): StepCreator;

}
