export class ResponseBuilder {
    _body = {};
    _statusCode = 200;

    body(body) {
        this._body = body;
        return this;
    }

    status(statusCode) {
        this._statusCode = statusCode;
        return this;
    }

    build() {
        return {
            is: {
                body: this._body,
                statusCode: this._statusCode
            }
        };
    }

}
