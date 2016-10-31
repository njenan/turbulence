export class PredicateBuilder {
    equalsProp;

    equals(equals) {
        this.equalsProp = equals;
        return this;
    }

    build() {
        return {
            equals: this.equalsProp
        };
    }

}
