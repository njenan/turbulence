var ctx = document.getElementById("responseTimesChart");

Chart.defaults.global.defaultFontColor = 'white';

Chart.defaults.global.elements.line.borderColor = 'white';

new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: "Response times over time",
            data: dataPoints
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                position: 'bottom'
            }]
        }
    }
});