/// <reference path="../../../typings/main/ambient/node/index.d.ts" />

import fs = require('fs');

export class StubFs {

    path:string;
    data:any;
    callback:(error:Error) => void;

    writeFile(path, data, callback) {
        this.path = path;
        this.data = data;
        this.callback = callback;

        fs.writeFile('Report.html', data, function () {
            console.error('You should disable this fs writing in StubFs.ts');
        });
    }
}