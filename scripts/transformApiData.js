var fs = require('fs');

var excludedClasses = [
    'AssertHttpResponseStep',
    'AssertStatusStep',
    'AbstractHttpStep',
    'HttpGetStep',
    'HttpPostStep',
    'HttpHeadStep',
    'HttpPutStep',
    'HttpDeleteStep',
    'PauseStep',
    'ProcessorStep',
    'BuildBreakerError',
    'EmbeddableStepCreator',
    'Injector',
    'ReportGenerator',
    'TestStep',
    'Executor',
    'HttpRequestRecord',
    'HttpClient',
    'Parent',
    'RandomPauseStep'
];


fs.readFile('./docs/_data/api.json', function (err, data) {
    if (err) {
        console.error(err);
        return;
    }

    var apiData = JSON.parse(data);


    apiData.children = apiData.children.filter(function (entry) {
        return excludedClasses.reduce(function (last, excludedClass) {
            return last && entry.name !== excludedClass;
        }, true);
    });

    apiData.children.forEach(function (child, index) {
        if (child.name === 'Turbulence') {
            apiData.children.splice(index, 1);
            apiData.children.unshift(child);
        }
        
        if (child.children) {
            child.children.forEach(function (grandchild, index) {
                if (grandchild.kind !== 2048) {
                    child.children.splice(index, 1);
                }

                if (grandchild.signatures) {
                    grandchild.signatures.forEach(function (signature, index) {
                        if (signature.comment && signature.comment.shortText && signature.comment.shortText.indexOf('@hidden') != -1) {
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