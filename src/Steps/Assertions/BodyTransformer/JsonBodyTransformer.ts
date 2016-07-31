import {HttpResponse} from "../../../Http/HttpResponse";
export function JsonBodyTransformer(resp:HttpResponse):any {
    resp.body = JSON.parse(resp.rawBody);
    return resp;
}