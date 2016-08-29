export class Parent<T> {
    value: T;

    constructor(value: T) {
        this.value = value;

        // Prevent circular reference when stringifying JSON
        Object.defineProperty(this, 'value', {
            enumerable: false
        });
    }
}
