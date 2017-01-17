var fs = require('fs');

fs.readFile('./docs/_data/api.json', function (err, data) {
    if (err) {
        console.error(err);
        return;
    }

    var apiData = JSON.parse(data);

    apiData.children.forEach(function (child, index) {
        if (child.name === 'Turbulence') {
            apiData.children.splice(index, 1);
            apiData.children.unshift(child);
        }

        if (child.children) {
            child.children.forEach(function (grandchild) {
                if (grandchild.signatures) {
                    grandchild.signatures.forEach(function (signature, index) {
                        if (signature.comment && signature.comment.shortText.indexOf('@hidden') != -1) {
                            grandchild.signatures.splice(index, 1);
                        }
                    });
                }
            });
        }
    });

    fs.writeFile('./docs/_data/api.json', JSON.stringify(apiData), function (err) {
        if (err) {
            console.error(err);
        }
    });
});