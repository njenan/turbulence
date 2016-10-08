responseTimesChart = document.getElementById('responseTimesChart');
Chart.defaults.global.defaultFontColor = 'white';
Chart.defaults.global.elements.line.borderColor = 'white';
// tslint:disable-next-line:no-unused-new
new Chart(responseTimesChart, {
    bezierCurve: false,
    data: {
        datasets: [{
                data: responseTimesData,
                label: 'Response times over time',
                lineTension: 0
            }]
    },
    options: {
        bezierCurve: false,
        scales: {
            xAxes: [{
                    position: 'bottom',
                    type: 'time'
                }]
        }
    },
    type: 'line'
});
responsesPerIntervalChart = document.getElementById('responsesPerIntervalChart');
// tslint:disable-next-line:no-unused-new 
new Chart(responsesPerIntervalChart, {
    bezierCurve: false,
    data: {
        datasets: [{
                data: responsesPerIntervalData,
                label: 'Response per interval',
                lineTension: 0
            }]
    },
    options: {
        bezierCurve: false,
        scales: {
            xAxes: [{
                    position: 'bottom',
                    type: 'time'
                }]
        }
    },
    type: 'line'
});
