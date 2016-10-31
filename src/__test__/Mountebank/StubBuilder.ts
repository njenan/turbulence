export class StubBuilder {
    predicatesProp = [];
    responsesProp = [];

    addPredicate(predicate) {
        this.predicatesProp.push(predicate);
        return this;
    }

    addResponses(responses) {
        this.responsesProp.push(responses);
        return this;
    }

    build() {
        return {
            predicates: this.predicatesProp,
            responses: this.responsesProp
        };
    }
}
