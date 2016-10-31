export class ResponseBuilder {
    bodyProp = {};
    statusCodeProp = 200;

    body(body) {
        this.bodyProp = body;
        return this;
    }

    status(statusCode) {
        this.statusCodeProp = statusCode;
        return this;
    }

    build() {
        return {
            is: {
                body: this.bodyProp,
                statusCode: this.statusCodeProp
            }
        };
    }

}
