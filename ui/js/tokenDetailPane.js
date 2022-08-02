class TokenDetailPane {

    static self = $("#tokenDetailPane")
    static back = $("#tokenDetailPane .back")
    static name = $("#tokenDetailPane .name")
    static menu = {
        news: $("#tokenNewsBtn"),
        infos: $("#tokenInfosBtn")
    }
    static news = $("#tokenNews")
    static infos = $("#tokenInfos")
    static chart = $("#tokenDetailPane .chart")
    static chartLoading = $("#tokenDetailPane .chartLoading")
    static chartInfos = {
        name: $("#tokenDetailPane .infos .name"),
        logo: $("#tokenDetailPane .infos .logo"),
        price: $("#tokenDetailPane .infos .price"),
        change: $("#tokenDetailPane .infos .change"),
        changeVal: $("#tokenDetailPane .infos .change val")
    }

    constructor() {

        TokenDetailPane.back.click(function(){
            TokenDetailPane.self.hide()
        })

        TokenDetailPane.menu.news.click(function(){
            TokenDetailPane.menu.news.addClass("selected")
            TokenDetailPane.menu.infos.removeClass("selected")
            TokenDetailPane.news.show()
            TokenDetailPane.infos.hide()
        })

        TokenDetailPane.menu.infos.click(function(){
            TokenDetailPane.menu.infos.addClass("selected")
            TokenDetailPane.menu.news.removeClass("selected")
            TokenDetailPane.infos.show()
            TokenDetailPane.news.hide()
        })

    }

    displayToken(data){
        console.log(data)
        TokenDetailPane.chartInfos.name.html(data.name)
        TokenDetailPane.chartInfos.price.html("$" + Utils.beautifyAmount(data.price))

        if(MAIN_ASSET.contract == data.contract)
            TokenDetailPane.chartInfos.logo.css("background-image", "url('https://raw.githubusercontent.com/virgoproject/tokens/main/" + MAIN_ASSET.ticker + "/" + data.ticker + "/logo.png')");
        else
            TokenDetailPane.chartInfos.logo.css("background-image", "url('https://raw.githubusercontent.com/virgoproject/tokens/main/" + MAIN_ASSET.ticker + "/" + data.contract + "/logo.png')");

        TokenDetailPane.chartInfos.changeVal.html(Math.abs(data.change).toFixed(2))
        if(data.change >= 0)
            TokenDetailPane.chartInfos.change.removeClass("negative")
        else
            TokenDetailPane.chartInfos.change.addClass("negative")

        this.displayChart(data);

        TokenDetailPane.self.show()
    }

    displayChart(data){
        TokenDetailPane.chart.html("")
        TokenDetailPane.chartLoading.show()

        let contractAddr = data.contract
        if(MAIN_ASSET.contract == data.contract)
            contractAddr = MAIN_ASSET.ticker

        fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/"+MAIN_ASSET.ticker+"/"+contractAddr+"/infos.json")
            .then(function(resp){
                resp.json().then(function(tokenInfos){
                    fetch("https://api.coingecko.com/api/v3/coins/"+tokenInfos.CG_ID+"/ohlc?vs_currency=usd&days=1").then(function(resp2){
                        resp2.json().then(function(ohlc){
                            const chartData = TokenDetailPane.ohlcToLine(ohlc)

                            const entries = new Map(chartData)
                            const obj = Object.fromEntries(entries)

                            TokenDetailPane.chart.append("<canvas></canvas>")

                            const ctxs = TokenDetailPane.chart.find("canvas").get(0).getContext('2d')

                            const gradient = ctxs.createLinearGradient(0, 0, 0, 150)
                            let lineColor = 'rgba(22,199,132,1)'
                            if(data.fluctuation >= 0){
                                gradient.addColorStop(0, 'rgba(22,199,132,0.5)')
                                gradient.addColorStop(1, 'rgba(22,199,132,0.0)')
                            }else{
                                gradient.addColorStop(0, 'rgba(234,60,70,0.5)')
                                gradient.addColorStop(1, 'rgba(234,60,70,0.0)')
                                lineColor = 'rgba(234,60,70,1)'
                            }

                            var datas = {
                                datasets: [{
                                    data: obj,
                                    pointRadius: 0,
                                    hoverPointRadius: 0,
                                    fill: {
                                        target: 'origin',
                                        above: gradient,   // Area will be red above the origin
                                        fillOpacity: 1,
                                    },
                                    borderColor: lineColor,
                                    tension: 0.5,
                                }]
                            }

                            const configs = {
                                type: 'line',
                                data: datas,
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
                                    }
                                }
                            }

                            new Chart(ctxs, configs)

                            TokenDetailPane.chartLoading.hide()

                        })
                    })
                })
            })
    }

    static ohlcToLine(ohlc){
        const line = []

        for(let row of ohlc){
            line.push([
                row[0],
                row[1]
            ])
        }

        return line
    }

}

const tokenDetailPane = new TokenDetailPane()