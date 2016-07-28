var responseTimesChart = document.getElementById("responseTimesChart");

Chart.defaults.global.defaultFontColor = 'white';

Chart.defaults.global.elements.line.borderColor = 'white';

new Chart(responseTimesChart, {
    type: 'line',
    data: {
        datasets: [{
            label: "Response times over time",
            data: responseTimesData,
            lineTension: 0
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                position: 'bottom'
            }]
        },
        bezierCurve: false
    },
    bezierCurve: false
});

var responsesPerIntervalChart = document.getElementById("responsesPerIntervalChart");

new Chart(responsesPerIntervalChart, {
    type: 'line',
    data: {
        datasets: [{
            label: "Response per interval",
            data: responsesPerIntervalData,
            lineTension: 0
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                position: 'bottom'
            }]
        },
        bezierCurve: false
    },
    bezierCurve: false
});