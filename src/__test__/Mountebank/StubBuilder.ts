export class StubBuilder {
    _predicates = [];
    _responses = [];

    addPredicate(predicate) {
        this._predicates.push(predicate);
        return this;
    }

    addResponses(responses) {
        this._responses.push(responses);
        return this;
    }

    build() {
        return {
            predicates: this._predicates,
            responses: this._responses
        };
    }
}
