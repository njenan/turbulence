export class BuildBreakerError implements Error {
    message;
    results;
    name = 'BuildBreakerError';

    constructor(message, results) {
        this.message = message;
        this.results = results;
    }
}
