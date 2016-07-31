import {HttpResponse} from "../../../Http/HttpResponse";

export interface BodyTransformer {
    (body:HttpResponse):any
}
