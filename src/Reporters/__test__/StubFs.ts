export class StubFs {

    path:string;
    data:any;
    callback:(error:Error) => void;

    writeFile(path, data, callback) {
        this.path = path;
        this.data = data;
        this.callback = callback;
    }
}