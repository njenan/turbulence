export class PredicateBuilder {
    _equals;

    equals(equals) {
        this._equals = equals;
        return this;
    }

    build() {
        return {
            equals: this._equals
        };
    }

}
