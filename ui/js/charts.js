
newArray = [
    [
        68.7,
        6069.793943786011
    ],
    [
        69.1,
        5879.904689004858
    ],
    [
        69.3,
        5784.960061614278
    ],
    [
        71.1,
        4930.458415099063
    ],
    [
        71.8,
        4598.152219232035
    ],
    [
        73,
        4028.4844548885576
    ],
    [
        73.2,
        3933.539827497977
    ],
    [
        73.6,
        3743.6505727168224
    ],
    [
        74.5,
        3316.399749459213
    ],
    [
        74.7,
        3221.4551220686317
    ],
    [
        74.8,
        3173.9828083733455
    ],
    [
        75.6,
        2794.2042988110297
    ],
    [
        75.7,
        2746.7319851157354
    ],
    [
        76.5,
        2366.9534755534196
    ],
    [
        76.6,
        2319.4811618581325
    ],
    [
        77.2,
        2034.647279686391
    ],
    [
        77.4,
        1939.7026522958095
    ],
    [
        78.4,
        1464.9795153429131
    ],
    [
        78.6,
        1370.034887952339
    ],
    [
        78.8,
        1275.0902605617584
    ],
    [
        80.1,
        657.9501825229945
    ],
    [
        80.4,
        515.5332414371196
    ],
    [
        80.6,
        420.58861404654635
    ],
    [
        81,
        230.69935926538437
    ],
    [
        81.7,
        0
    ],
    [
        82.4,
        0
    ],
    [
        83.1,
        0
    ],
    [
        83.3,
        0
    ],
    [
        83.7,
        0
    ],
    [
        83.8,
        0
    ]
]

const entries = new Map(newArray);
const obj = Object.fromEntries(entries);

var data = {
    datasets: [{
        label: 'My First Dataset',
        data: obj,
        pointRadius: 0,
        hoverPointRadius: 0,
        fill: {
            target: 'origin',
            above: 'rgba(84, 84, 84,0.15)',   // Area will be red above the origin
            below: 'rgba(84, 84, 84,0.15)'    // And blue below the origin
        },
        borderColor: 'rgba(84, 84, 84,0.15)',
        tension: 0.1,

    }]
};

const config = {
    type: 'line',
    data: data,
    options: {
        scales: {
            x: {
                ticks: {
                    display: false,
                },
                grid: {
                    display: false,
                }
            },
            y: {
                ticks: {
                    display: false,
                },
                grid: {
                    display: false,
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            },
        }
    }
};


var ctx = document.getElementById("graph");
new Chart(ctx, config);