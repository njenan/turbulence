import {HttpResponse} from "../Http/HttpResponse";
import {HttpGetStep} from "./HttpGetStep";

export class HttpRequestRecord {
    type:string;
    url:string;
    label:string;
    status:number;
    error:boolean;
    duration:number;

    constructor(step:HttpGetStep, response:HttpResponse, duration:number) {
        this.type = step.getType();
        this.url = step.url;
        this.label = step.label;
        this.status = response.statusCode;
        this.error = false;
        this.duration = duration;
    }
}
