import {UserJourney} from "./UserJourney";
import {HttpResponse} from "./HttpResponse";
import {Step} from "./Step";

export class HttpGetStep implements Step {
    parent:UserJourney;
    url:String;
    predicates:Array<(resp:HttpResponse) => boolean>;
    expectedStatusCode:Number;
    type:String;

    constructor(parent, url, type) {
        this.parent = parent;
        this.url = url;
        this.type = type;
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

    pause(milliseconds:Number) {
        return this.parent.pause(milliseconds);
    }

    execute() {
        return this.parent.http.get(this.url)
    }
}