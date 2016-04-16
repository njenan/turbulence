export class HttpResponse {
    body;
    statusCode:number;

    constructor(body?, statusCode?) {
        this.body = body ? body : {};
        this.statusCode = statusCode ? statusCode : 200;
    }
}