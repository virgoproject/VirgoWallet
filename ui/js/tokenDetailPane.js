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
    static periodBtns = $("#tokenDetailPane .periodBtns .periodBtn")
    static newsContainer = $("#tokenNews .newsContainer")
    static newsLoading = $("#tokenNewsLoading")
    static sampleNews = $("#sampleTokenNews")
    static infosAdditional = $("#tokenInfos .additional")
    static infosAdditionalBtn = $("#tokenInfos .additionalBtn")


    constructor() {
        const _this = this

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

        TokenDetailPane.periodBtns.click(function(){
            if($(this).hasClass("active")) return

            TokenDetailPane.periodBtns.removeClass("active")
            $(this).addClass("active")
            _this.initChart($(this).attr("data-period"))
        })

        TokenDetailPane.chart.on("mouseout", function(e){
            setTimeout(function(){
                TokenDetailPane.chartInfos.price.html("$" + Utils.beautifyAmount(_this.data.price))
                TokenDetailPane.chartInfos.changeVal.html(Math.abs(_this.data.change).toFixed(2))
                if(_this.data.change >= 0)
                    TokenDetailPane.chartInfos.change.removeClass("negative")
                else
                    TokenDetailPane.chartInfos.change.addClass("negative")
            }, 10)
        })

        TokenDetailPane.infosAdditionalBtn.click(function(){
            if(TokenDetailPane.infosAdditionalBtn.hasClass("active")){
                TokenDetailPane.infosAdditionalBtn.removeClass("active")
                TokenDetailPane.infosAdditional.css("display", "none")
            }else{
                TokenDetailPane.infosAdditionalBtn.addClass("active")
                TokenDetailPane.infosAdditional.css("display", "contents")
            }
        })

    }

    displayToken(data){
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

        this.data = data
        this.initChart(1);
        this.initNews()

        TokenDetailPane.self.show()
    }

    initChart(period){
        TokenDetailPane.chart.html("")
        TokenDetailPane.chartLoading.show()

        let contractAddr = this.data.contract
        if(MAIN_ASSET.contract == this.data.contract)
            contractAddr = MAIN_ASSET.ticker

        const _this = this

        if(this.tokenInfos === undefined || this.tokenInfos.contract != this.data.contract)
            fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/"+MAIN_ASSET.ticker+"/"+contractAddr+"/infos.json")
                .then(function(resp){
                    resp.json().then(function(tokenInfos){
                        _this.tokenInfos = tokenInfos
                        _this.fetchAndDisplayChart(_this.data, tokenInfos, period)
                        _this.initInfos()
                    })
                })
        else {
            this.fetchAndDisplayChart(this.data, this.tokenInfos, period)
            _this.initInfos()
        }
    }

    fetchAndDisplayChart(data, tokenInfos, period){

        fetch("https://api.coingecko.com/api/v3/coins/"+tokenInfos.CG_ID+"/ohlc?vs_currency=usd&days="+period).then(function(resp){
            resp.json().then(function(ohlc){
                const chartData = TokenDetailPane.ohlcToLine(ohlc)

                const entries = new Map(chartData)
                const obj = Object.fromEntries(entries)

                TokenDetailPane.chart.append("<canvas></canvas>")

                const ctxs = TokenDetailPane.chart.find("canvas").get(0).getContext('2d')

                const gradient = ctxs.createLinearGradient(0, 0, 0, 150)
                let lineColor = 'rgba(22,199,132,1)'

                if(chartData[chartData.length-1][1]-chartData[0][1] >= 0){
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
                        },
                        onHover: function (e) {
                            const canvasPosition = Chart.helpers.getRelativePosition(e, chart)
                            const x = chart.scales.x.getValueForPixel(canvasPosition.x)
                            const data = chart.data.datasets[0].data
                            const key = Object.keys(data)[x]
                            TokenDetailPane.chartInfos.price.html("$" + Utils.beautifyAmount(data[key]))

                            const val0Key = Object.keys(data)[0]
                            const initialPrice = data[val0Key]
                            const variation = (data[key]/initialPrice-1)*100
                            TokenDetailPane.chartInfos.changeVal.html(Math.abs(variation).toFixed(2))
                            if(variation >= 0)
                                TokenDetailPane.chartInfos.change.removeClass("negative")
                            else
                                TokenDetailPane.chartInfos.change.addClass("negative")
                        }
                    }
                })

                TokenDetailPane.chartLoading.hide()

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

    initNews(){
        TokenDetailPane.newsContainer.html()
        TokenDetailPane.newsLoading.show()

        fetch("http://virgo.net/fakenewsapi/").then(function(resp){
            resp.json().then(function(json){

                TokenDetailPane.newsLoading.hide()

                for(let news of json){
                    const elem = TokenDetailPane.sampleNews.clone()
                    elem.css("background", "url('"+news.image+"')")
                    elem.find(".title").html(news.name)

                    const date = new Date(news.date)
                    let options = {month: "short", day: "numeric"};
                    elem.find(".subtitle").html(news.sitename + " - " + date.toLocaleDateString("en-US", options))

                    elem.click(function(){
                        window.open(news.link, "_blank")
                    })

                    TokenDetailPane.newsContainer.append(elem)
                    elem.show()
                }

            })
        })
    }

    initInfos(){
        const _this = this

        fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids="+this.tokenInfos.CG_ID+"&order=market_cap_desc&per_page=100&page=1&sparkline=false")
            .then(function(resp){
                resp.json().then(function(cgInfos){
                    cgInfos = cgInfos[0]
                    console.log(cgInfos)
                    TokenDetailPane.infos.find(".cgRank").html("#" + cgInfos.market_cap_rank)
                    TokenDetailPane.infos.find(".marketcap").html("$" + Utils.beautifyAmount(cgInfos.market_cap))
                    TokenDetailPane.infos.find(".volume").html("$" + Utils.beautifyAmount(cgInfos.total_volume))
                    TokenDetailPane.infos.find(".circulating").html(Utils.beautifyAmount(cgInfos.circulating_supply) + " " + _this.data.ticker)
                    TokenDetailPane.infos.find(".totalSupply").html(Utils.beautifyAmount(cgInfos.total_supply) + " " + _this.data.ticker)

                    if(cgInfos.max_supply != null)
                        TokenDetailPane.infos.find(".maxSupply").html(Utils.beautifyAmount(cgInfos.max_supply) + " " + _this.data.ticker)

                    TokenDetailPane.infos.find(".ath").html("$" + Utils.beautifyAmount(cgInfos.ath))
                    TokenDetailPane.infos.find(".atl").html("$" + Utils.beautifyAmount(cgInfos.atl))
                })
            })
    }

}

const tokenDetailPane = new TokenDetailPane()