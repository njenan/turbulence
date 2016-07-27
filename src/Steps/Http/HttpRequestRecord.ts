import {HttpResponse} from "../../Http/HttpResponse";
import {AbstractHttpStep} from "./HttpStep";

export class HttpRequestRecord {
    type:string;
    url:string;
    label:string;
    status:number;
    error:boolean;
    duration:number;
    timestamp:number;

    constructor(step:AbstractHttpStep, response:HttpResponse, duration:number, timestamp) {
        this.type = step.getType();
        this.url = step.url;
        this.label = step.label;
        this.status = response.statusCode;
        this.error = false;
        this.duration = duration;
        this.timestamp = timestamp;
    }
}
