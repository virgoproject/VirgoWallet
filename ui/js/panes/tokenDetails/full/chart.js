class TokenChart extends StatefulElement {

    render() {

        const _this = this

        const {data, loading} = this.useFunction(async () => {
            const infos = await getBaseInfos()
            const tokenInfos = await getTokenDetailsCross(_this.getAttribute("address"), infos.wallets[infos.selectedWallet].wallet.chainID)
            const res = await fetch("https://api.coingecko.com/api/v3/coins/"+_this.getAttribute("cgid")+"/ohlc?vs_currency="+infos.selectedCurrency+"&days="+_this.getAttribute("period"))
            const json = await res.json()

            const line = []

            for(let row of json){
                line.push([
                    row[0],
                    row[1]
                ])
            }

            return {
                baseInfos: infos,
                tokenInfos: tokenInfos,
                chart: line
            }
        })

        if(loading){
            return `
                <div class="px-3">
                    <div id="tickerShimmer" class="shimmerBG text-sm"></div>
                    <div id="amountWrapper">
                        <div id="priceShimmer" class="shimmerBG"></div>
                        <div id="variationShimmer" class="shimmerBG text-sm"></div>
                    </div>
                </div>
                <div id="chartShimmer" class="mt-3 shimmerBG"></div>
            `
        }

        this.chartData = data.chart

        const variation = (data.chart[data.chart.length-1][1]-data.chart[0][1])/data.chart[0][1]*100

        return `
            <div class="px-3">
                <p id="ticker" class="text-sm">${data.tokenInfos.ticker + "/" + data.baseInfos.selectedCurrency.toUpperCase()}</p>
                <div id="amountWrapper">
                    <p id="price">${Utils.beautifyAmount(data.chart[data.chart.length-1][1]) + " " + currencyToSymbol(data.baseInfos.selectedCurrency)}</p>
                    <p id="variation" class="text-sm ${variation < 0 ? 'negative' : ''}">${variation > 0 ? "+" : "-"} ${Utils.beautifyAmount(Math.abs(variation))} %</p>
                </div>
            </div>
            <canvas id="chart" class="mt-3"></canvas>
        `
    }

    afterRender() {
        if(!this.chartData) return

        const entries = new Map(this.chartData)
        const obj = Object.fromEntries(entries)

        const ctxs = this.querySelector("#chart").getContext('2d')

        const gradient = ctxs.createLinearGradient(0, 0, 0, 150)
        let lineColor = 'rgba(22,199,132,1)'

        if(this.chartData[this.chartData.length-1][1]-this.chartData[0][1] >= 0){
            gradient.addColorStop(0, 'rgba(22,199,132,0.5)')
            gradient.addColorStop(1, 'rgba(22,199,132,0.0)')
        }else{
            gradient.addColorStop(0, 'rgba(234,60,70,0.5)')
            gradient.addColorStop(1, 'rgba(234,60,70,0.0)')
            lineColor = 'rgba(234,60,70,1)'
        }

        const chart = new Chart(ctxs, {
            type: 'line',
            data: {
                datasets: [{
                    data: obj,
                    pointRadius: 0,
                    fill: {
                        target: 'origin',
                        above: gradient,   // Area will be red above the origin
                        fillOpacity: 1,
                    },
                    borderColor: lineColor,
                    tension: 0.5,
                }]
            },
            options: {
                scales: {
                    x: {
                        display: false,
                        ticks: {
                            display: false,
                        },
                        grid: {
                            display: false,
                        }
                    },
                    y: {
                        display: false,
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
                        display: false,
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                animation: {
                    duration: 0
                },
                hover: {
                    mode: 'nearest',
                    axis: "x",
                    intersect: false
                }
            }
        })
    }

    style() {
        return `
            #amountWrapper {
                display: flex;
                flex-wrap: nowrap;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }
            
            #ticker {
                margin: 0;
                color: var(--gray-400);
            }
            
            #variation {
                margin: 0;
                background: var(--green-600);
                color: white;
                padding: 0.5em;
                border-radius: 0.5em;
                font-weight: 600;
            }
            
            #variation.negative {
                background: var(--red-600);
            }
            
            #price {
                margin: 0;
                font-size: 2em;
                line-height: 1em;
                color: var(--gray-700);
                font-weight: 600;
            }
            
            #chart {
                height: 120px!important;
            }
            
            #tickerShimmer {
                height: 0.875em;
                margin: 0.1875em 0;
                width: 8ch;
                border-radius: 0.5em;
            }
            
            #priceShimmer {
                height: 2em;
                width: 12ch;
                border-radius: 0.5em;
            }
            
            #variationShimmer {
                height: 28px;
                width: 8ch;
                border-radius: 0.5em;
            }
            
            #chartShimmer {
                height: 123px;
                width: 100%;
                border-radius: 0!important;
            }
            
            .shimmerBG {
                border-radius: 0.5em;
            }
            
        `;
    }

}

Stateful.define("token-chart", TokenChart)
