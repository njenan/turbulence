/**
 * A class containing the http response returned by the server.
 */
export class HttpResponse {
    rawBody;
    body;
    statusCode: number;

    constructor(body?, statusCode?) {
        this.rawBody = body ? body : '';
        this.statusCode = statusCode ? statusCode : 200;
    }

    /**
     * Get the body of the http response.
     *
     * @returns {any}
     */
    public getBody(): any {
        return this.rawBody;
    }

    /**
     * Get the status code of the http response as a number.
     *
     * @returns {number}
     */
    public getStatusCode(): number {
        return this.statusCode;
    }
}
