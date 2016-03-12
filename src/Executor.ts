import {UserJourney} from "./UserJourney";

export class Executor {
    journeys:Array<UserJourney>;

    constructor(journeys) {
        this.journeys = journeys;
    }

    run(cb) {

    }
}