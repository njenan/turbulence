export class Parent<T> {
    value: T;
    enumerable: boolean = false;

    constructor(value: T) {
        this.value = value;
    }
}