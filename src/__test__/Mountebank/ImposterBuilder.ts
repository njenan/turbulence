export class ImposterBuilder {
    _port = 4545;
    _protocol = 'http';
    _stubs = [];

    port(port) {
        this._port = port;
        return this;
    }

    protocol(protocol) {
        this._protocol = protocol;
        return this;
    }

    addStub(stub) {
        this._stubs.push(stub);
        return this;
    }

    build() {
        return {
            protocol: this._protocol,
            port: this._port,
            stubs: this._stubs
        };
    }
}
