export class ImposterBuilder {
    portProp = 4545;
    protocolProp = 'http';
    stubsProp = [];

    port(port) {
        this.portProp = port;
        return this;
    }

    protocol(protocol) {
        this.protocolProp = protocol;
        return this;
    }

    addStub(stub) {
        this.stubsProp.push(stub);
        return this;
    }

    build() {
        return {
            port: this.portProp,
            protocol: this.protocolProp,
            stubs: this.stubsProp
        };
    }
}
