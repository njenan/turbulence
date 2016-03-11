import {UserJourney} from "./UserJourney";
import {HttpResponse} from "./HttpResponse";

export class JourneyStep {
    parent:UserJourney;
    url:String;
    predicates:Array<(resp:HttpResponse) => boolean>;
    expectedStatusCode:Number;

    constructor(parent, url) {
        this.parent = parent;
        this.url = url;
        this.predicates = [];
        this.expectedStatusCode = 200;
    }

    assertResponse(predicate) {
        this.predicates.unshift(predicate);
        return this;
    }

    expectStatus(code) {
        this.expectedStatusCode = code;
        return this;
    }

    get(url) {
        return this.parent.get(url);
    }

    endTest() {
        return this.parent.endTest();
    }
}