export class HttpResponse {
    rawBody;
    body;
    statusCode:number;

    constructor(body?, statusCode?) {
        this.rawBody = body ? body : {};
        this.statusCode = statusCode ? statusCode : 200;
    }
}