class TokenDetailPane {

    static self = $("#tokenDetailPane")
    static back = $("#tokenDetailPane .back")
    static loading = $("#tokenDetailsPaneLoading")
    static simplePane = {
        self: $("#tokenDetailsSimple"),
        name: $("#tokenDetailsSimple .name"),
        logo: $("#tokenDetailsSimple .logo"),
        symbol: $("#tokenDetailsSimple .symbol"),
        decimals: $("#tokenDetailsSimple .decimals"),
        address: $("#tokenDetailsSimple .address"),
        delete: $("#tokenDetailSimpleDel")
    }
    static detailedPane = {
        self: $("#tokenDetailsDetailed"),
        name: $("#tokenDetailPane .name"),
        menu: {
            news: $("#tokenNewsBtn"),
            infos: $("#tokenInfosBtn")
        },
        news: $("#tokenNews"),
         infos: $("#tokenInfos"),
         chart: $("#tokenDetailPane .chart"),
         chartLoading: $("#tokenDetailPane .chartLoading"),
         chartInfos: {
            name: $("#tokenDetailPane .infos .name"),
            logo: $("#tokenDetailPane .infos .logo"),
            price: $("#tokenDetailPane .infos .price"),
            change: $("#tokenDetailPane .infos .change"),
            changeVal: $("#tokenDetailPane .infos .change val")
        },
        periodBtns: $("#tokenDetailPane .periodBtns .periodBtn"),
        newsContainer: $("#tokenNews .newsContainer"),
        newsLoading: $("#tokenNewsLoading"),
        sampleNews: $("#sampleTokenNews"),
        infosAdditional: $("#tokenInfos .additional"),
        infosAdditionalBtn: $("#tokenInfos .additionalBtn"),
        descReadMore: $("#tokenInfos .readmore"),
        infosLoading: $("#tokenInfosLoading"),
        infosWrapper: $("#tokenInfosWrapper")
    }

    constructor() {
        const _this = this

        TokenDetailPane.back.click(function(){
            TokenDetailPane.self.hide()
        })

        TokenDetailPane.detailedPane.menu.news.click(function(){
            TokenDetailPane.detailedPane.menu.news.addClass("selected")
            TokenDetailPane.detailedPane.menu.infos.removeClass("selected")
            TokenDetailPane.detailedPane.news.show()
            TokenDetailPane.detailedPane.infos.hide()
        })

        TokenDetailPane.detailedPane.menu.infos.click(function(){
            TokenDetailPane.detailedPane.menu.infos.addClass("selected")
            TokenDetailPane.detailedPane.menu.news.removeClass("selected")
            TokenDetailPane.detailedPane.infos.show()
            TokenDetailPane.detailedPane.news.hide()
        })

        TokenDetailPane.detailedPane.periodBtns.click(function(){
            if($(this).hasClass("active")) return

            TokenDetailPane.detailedPane.periodBtns.removeClass("active")
            $(this).addClass("active")
            _this.initChart($(this).attr("data-period"))
        })

        TokenDetailPane.detailedPane.chart.on("mouseout", function(e){
            setTimeout(function(){
                TokenDetailPane.detailedPane.chartInfos.price.html("$" + Utils.beautifyAmount(_this.data.price))
                TokenDetailPane.detailedPane.chartInfos.changeVal.html(Math.abs(_this.data.change).toFixed(2))
                if(_this.data.change >= 0)
                    TokenDetailPane.detailedPane.chartInfos.change.removeClass("negative")
                else
                    TokenDetailPane.detailedPane.chartInfos.change.addClass("negative")
            }, 10)
        })

        TokenDetailPane.detailedPane.infosAdditionalBtn.click(function(){
            if(TokenDetailPane.detailedPane.infosAdditionalBtn.hasClass("active")){
                TokenDetailPane.detailedPane.infosAdditionalBtn.removeClass("active")
                TokenDetailPane.detailedPane.infosAdditional.css("display", "none")
            }else{
                TokenDetailPane.detailedPane.infosAdditionalBtn.addClass("active")
                TokenDetailPane.detailedPane.infosAdditional.css("display", "contents")
            }
        })

        TokenDetailPane.detailedPane.descReadMore.click(function(){
            window.open("https://www.coingecko.com/en/coins/"+_this.tokenInfos.CG_ID, "_blank")
        })


    }

    displayToken(data){
        TokenDetailPane.detailedPane.menu.news.click()
        TokenDetailPane.self.find("[data-period=1]").click()
        TokenDetailPane.detailedPane.chartInfos.name.html(data.name)
        TokenDetailPane.detailedPane.chartInfos.price.html("$" + Utils.beautifyAmount(data.price))

        if(MAIN_ASSET.contract == data.contract)
            TokenDetailPane.detailedPane.chartInfos.logo.css("background-image", "url('https://raw.githubusercontent.com/virgoproject/tokens/main/" + MAIN_ASSET.ticker + "/" + data.ticker + "/logo.png')");
        else
            TokenDetailPane.detailedPane.chartInfos.logo.css("background-image", "url('https://raw.githubusercontent.com/virgoproject/tokens/main/" + MAIN_ASSET.ticker + "/" + data.contract + "/logo.png')");

        TokenDetailPane.simplePane.logo.attr("data-jdenticon-value", data.contract)
        jdenticon()

        TokenDetailPane.detailedPane.chartInfos.changeVal.html(Math.abs(data.change).toFixed(2))
        if(data.change >= 0)
            TokenDetailPane.detailedPane.chartInfos.change.removeClass("negative")
        else
            TokenDetailPane.detailedPane.chartInfos.change.addClass("negative")

        this.data = data
        TokenDetailPane.loading.show()
        TokenDetailPane.simplePane.self.hide()
        TokenDetailPane.detailedPane.self.hide()
        TokenDetailPane.self.show()
        this.initChart(1)
    }

    initChart(period){
        TokenDetailPane.detailedPane.chart.html("")
        TokenDetailPane.detailedPane.chartLoading.show()

        let contractAddr = this.data.contract
        if(MAIN_ASSET.contract == this.data.contract)
            contractAddr = MAIN_ASSET.ticker

        const _this = this

        if(this.tokenInfos === undefined || this.tokenInfos.contract != this.data.contract)
            fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/"+MAIN_ASSET.ticker+"/"+contractAddr+"/infos.json")
                .then(function(resp){
                    if(!resp.ok){

                        TokenDetailPane.simplePane.name.val(_this.data.name)
                        TokenDetailPane.simplePane.symbol.val(_this.data.ticker)
                        TokenDetailPane.simplePane.decimals.val(_this.data.decimals)
                        TokenDetailPane.simplePane.address.val(_this.data.contract)
                        TokenDetailPane.simplePane.delete.find("span").html(_this.data.ticker)
                        TokenDetailPane.simplePane.delete.unbind("click").click(function(){
                            removeToken(_this.data.contract)
                            $("#bal"+_this.data.contract).remove()
                            notyf.success("Removed " + _this.data.name + "!")
                            TokenDetailPane.back.click()
                        })

                        TokenDetailPane.simplePane.self.show()
                        TokenDetailPane.loading.hide()
                        return
                    }
                    resp.json().then(function(tokenInfos){
                        _this.tokenInfos = tokenInfos
                        _this.fetchAndDisplayChart(_this.data, tokenInfos, period)
                        _this.initInfos()
                        _this.initNews()
                        TokenDetailPane.detailedPane.self.show()
                        TokenDetailPane.loading.hide()
                    })
                })
        else {
            this.fetchAndDisplayChart(this.data, this.tokenInfos, period)
            _this.initInfos()
            _this.initNews()
            TokenDetailPane.detailedPane.self.show()
            TokenDetailPane.loading.hide()
        }
    }

    fetchAndDisplayChart(data, tokenInfos, period){

        fetch("https://api.coingecko.com/api/v3/coins/"+tokenInfos.CG_ID+"/ohlc?vs_currency=usd&days="+period).then(function(resp){
            resp.json().then(function(ohlc){
                const chartData = TokenDetailPane.ohlcToLine(ohlc)

                const entries = new Map(chartData)
                const obj = Object.fromEntries(entries)

                TokenDetailPane.detailedPane.chart.append("<canvas></canvas>")

                const ctxs = TokenDetailPane.detailedPane.chart.find("canvas").get(0).getContext('2d')

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
                            TokenDetailPane.detailedPane.chartInfos.price.html("$" + Utils.beautifyAmount(data[key]))

                            const val0Key = Object.keys(data)[0]
                            const initialPrice = data[val0Key]
                            const variation = (data[key]/initialPrice-1)*100
                            TokenDetailPane.detailedPane.chartInfos.changeVal.html(Math.abs(variation).toFixed(2))
                            if(variation >= 0)
                                TokenDetailPane.detailedPane.chartInfos.change.removeClass("negative")
                            else
                                TokenDetailPane.detailedPane.chartInfos.change.addClass("negative")
                        }
                    }
                })

                TokenDetailPane.detailedPane.chartLoading.hide()

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
        TokenDetailPane.detailedPane.newsContainer.html("")
        TokenDetailPane.detailedPane.newsLoading.show()

        fetch("http://virgo.net/fakenewsapi/").then(function(resp){
            resp.json().then(function(json){

                TokenDetailPane.detailedPane.newsLoading.hide()

                for(let news of json){
                    const elem = TokenDetailPane.detailedPane.sampleNews.clone()
                    elem.css("background", "url('"+news.image+"')")
                    elem.find(".title").html(news.name)

                    const date = new Date(news.date)
                    let options = {month: "short", day: "numeric"};
                    elem.find(".subtitle").html(news.sitename + " - " + date.toLocaleDateString("en-US", options))

                    elem.click(function(){
                        window.open(news.link, "_blank")
                    })

                    TokenDetailPane.detailedPane.newsContainer.append(elem)
                    elem.show()
                }

            })
        })
    }

    initInfos(){
        const _this = this

        TokenDetailPane.detailedPane.infosLoading.show()
        TokenDetailPane.detailedPane.infosWrapper.hide()

        fetch("https://api.coingecko.com/api/v3/coins/"+this.tokenInfos.CG_ID+"?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false")
            .then(function(resp){
                resp.json().then(function(cgInfos){
                    if(cgInfos.coingecko_rank != null)
                        TokenDetailPane.detailedPane.infos.find(".cgRank").html("#" + cgInfos.coingecko_rank)
                    else
                        TokenDetailPane.detailedPane.infos.find(".cgRank").html("#-")

                    TokenDetailPane.detailedPane.infos.find(".marketcap").html("$" + Utils.beautifyAmount(cgInfos.market_data.market_cap.usd))
                    TokenDetailPane.detailedPane.infos.find(".volume").html("$" + Utils.beautifyAmount(cgInfos.market_data.total_volume.usd))
                    TokenDetailPane.detailedPane.infos.find(".circulating").html(Utils.beautifyAmount(cgInfos.market_data.circulating_supply) + " " + _this.data.ticker)
                    TokenDetailPane.detailedPane.infos.find(".totalSupply").html(Utils.beautifyAmount(cgInfos.market_data.total_supply) + " " + _this.data.ticker)

                    if(cgInfos.market_data.max_supply != null)
                        TokenDetailPane.detailedPane.infos.find(".maxSupply").html(Utils.beautifyAmount(cgInfos.market_data.max_supply) + " " + _this.data.ticker)
                    else
                        TokenDetailPane.detailedPane.infos.find(".maxSupply").html("-")

                    TokenDetailPane.detailedPane.infos.find(".ath").html("$" + Utils.beautifyAmount(cgInfos.market_data.ath.usd))
                    TokenDetailPane.detailedPane.infos.find(".atl").html("$" + Utils.beautifyAmount(cgInfos.market_data.atl.usd))

                    let descText = jQuery("<p>"+cgInfos.description.en+"</p>").text()
                    if(descText.length > 320){
                        descText = descText.substring(0, 170) + "..."
                        TokenDetailPane.detailedPane.descReadMore.show()
                    }else{
                        TokenDetailPane.detailedPane.descReadMore.hide()
                    }
                    TokenDetailPane.detailedPane.infos.find(".desc").html(descText)

                    TokenDetailPane.detailedPane.infosLoading.hide()
                    TokenDetailPane.detailedPane.infosWrapper.show()
                })
            })
    }

}

const tokenDetailPane = new TokenDetailPane()
