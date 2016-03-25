export class HttpResponse {
    body;
    statusCode:Number;

    constructor(body?, statusCode?) {
        this.body = body ? body : {};
        this.statusCode = statusCode ? statusCode : 200;
    }
}