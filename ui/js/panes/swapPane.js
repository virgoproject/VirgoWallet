class SwapPane {

    static inputs = {
        one: {
            input: $("#swapInput1"),
            btnSelect: $("#tokenSelectBtn1"),
            img: $("#selectedTokenImg1"),
            ticker: $("#selectedTokenTicker1"),
            contract: $("#sendContract"),
            rateTicker: $("#swapRateTicker1"),
            balance: $("#swapBalance1"),
            btnTicker: $("#swapBtnTicker1"),
            btnMax: $("#swapMaxBtn1")
        },
        two: {
            input: $("#swapInput2"),
            btnSelect: $("#tokenSelectBtn2"),
            img: $("#selectedTokenImg2"),
            ticker: $("#selectedTokenTicker2"),
            contract: $("#sendContract2"),
            rateTicker: $("#swapRateTicker2"),
            balance: $("#swapBalance2"),
            btnTicker: $("#swapBtnTicker2")
        }
    }
    static rate = {
        self: $("#swapRate"),
        loading: $("#swapRateLoading"),
        amount: $("#swapRateAmount"),
        notFound: $("#swapRouteNotFound")
    }
    static params = $("#swapParams")
    static switchBtn = $("#swapSwitchBtn")
    static initBtn = $("#initSwapBtn")
    static loading = $("#swapLoading")
    static review = {
        self: $("#swapReview"),
        amountIn: $("#swapReviewAmountIn"),
        inTicker: $("#swapReviewTickerIn"),
        amountOut: $("#swapReviewAmountOut"),
        outTicker: $("#swapReviewTickerOut"),
        swapFees: $("#swapReviewSwapFees"),
        swapFeesTicker: $("#swapReviewSwapFeesTicker"),
        networkFees: $("#swapReviewNetFees"),
        networkFeesTicker: $("#swapReviewNetFeesTicker"),
        rangeFees: $("#swapRangeFees"),
        confirmBtn: $("#confirmSwapBtn"),
        back: $("#swapReviewBack")
    }
    static comingSoon = $("#swapComing")
    static header = $(".header")

    constructor() {
        this.select1OldElem = ""
        this.select2OldElem = ""

        const _this = this

        SwapPane.inputs.one.input.on("input", function(){
            _this.checkAmount()
        })

        SwapPane.inputs.one.btnMax.click(function () {
            if (SwapPane.inputs.one.btnSelect.html() == "" || isNaN(SwapPane.inputs.one.balance.html())) return
            SwapPane.inputs.one.input.val(SwapPane.inputs.one.balance.html())
            SwapPane.inputs.one.input.trigger("input")
        })

        SwapPane.inputs.one.btnSelect.click(function () {
            tokenSelect.displayTokenSelect(json => {
                document.getElementById("selectedTokenTicker1").innerHTML = json.ticker
                document.getElementById("swapTicker1").innerHTML = json.ticker
                document.getElementById("sendContract").innerHTML = json.contract

                $("#selectedTokenSvg1").show()
                $("#selectedTokenImg1").hide()

                $("#selectedTokenImg1").on('load', function() {
                    $("#selectedTokenSvg1").hide()
                    $("#selectedTokenImg1").show()
                }).attr("src", "https://github.com/virgoproject/tokens/blob/main/" + MAIN_ASSET.ticker + "/" + json.contract + "/logo.png?raw=true")

                $("#selectedTokenSvg1").attr("data-jdenticon-value", json.contract)

                $("#swapReviewSelectedTokenSvg").show()
                $("#swapReviewSelectedTokenImg").hide()

                $("#swapReviewSelectedTokenImg").on('load', function() {
                    $("#swapReviewSelectedTokenSvg").hide()
                    $("#swapReviewSelectedTokenImg").show()
                }).attr("src", "https://github.com/virgoproject/tokens/blob/main/" + MAIN_ASSET.ticker + "/" + json.contract + "/logo.png?raw=true")

                $("#swapReviewSelectedTokenSvg").attr("data-jdenticon-value", json.contract)
                jdenticon()

                document.getElementById("tokenSelect").style.display = "none"
                document.getElementById("imgDiv1").style.display = "block"
                $("#tokenSelect1").attr("class", "col-6 justify-content-center align-self-center p-0")
                _this.updateBalance(SwapPane.inputs.one)
                _this.checkAmount()
            }, document.getElementById("sendContract2").innerHTML)
        })

        SwapPane.inputs.two.btnSelect.click(function () {
            tokenSelect.displayTokenSelect(json => {
                document.getElementById("selectedTokenTicker2").innerHTML = json.ticker
                document.getElementById("swapTicker2").innerHTML = json.ticker
                document.getElementById("sendContract2").innerHTML = json.contract
                document.getElementById("imgDiv2").style.display = "block"

                $("#selectedTokenSvg2").show()
                $("#selectedTokenImg2").hide()

                $("#selectedTokenImg2").on('load', function() {
                    $("#selectedTokenSvg2").hide()
                    $("#selectedTokenImg2").show()
                }).attr("src", "https://github.com/virgoproject/tokens/blob/main/" + MAIN_ASSET.ticker + "/" + json.contract + "/logo.png?raw=true")

                $("#selectedTokenSvg2").attr("data-jdenticon-value", json.contract)
                jdenticon()

                document.getElementById("tokenSelect").style.display = "none"
                $("#tokenSelect2").attr("class", "col-6 justify-content-center align-self-center p-0")
                _this.updateBalance(SwapPane.inputs.two)
                _this.checkAmount()
            }, document.getElementById("sendContract").innerHTML)
        })

        $("#tokenBack").click(function () {
            $("#tokenSelect").hide()
        })

        SwapPane.switchBtn.click(function () {
            const elem = document.getElementById("tokenSelectBtn1")
            const elem2 = document.getElementById("tokenSelectBtn2")

            const oneVal = SwapPane.inputs.one.ticker.html()
            const twoVal = SwapPane.inputs.two.ticker.html()

            const contactOne = SwapPane.inputs.one.contract.html()
            const contractTwo = SwapPane.inputs.two.contract.html()

            const img1Disp = document.getElementById("selectedTokenImg1").style.display
            const img2Disp = document.getElementById("selectedTokenImg2").style.display

            document.getElementById("selectedTokenImg1").style.display = img2Disp
            document.getElementById("swapReviewSelectedTokenImg").style.display = img2Disp
            document.getElementById("selectedTokenImg2").style.display = img1Disp

            const img1 = elem.getElementsByTagName("img")[0].src
            const img2 = elem2.getElementsByTagName("img")[0].src

            const swapTicker1 = $("#swapTicker1").html()
            const swapTicker2 = $("#swapTicker2").html()

            SwapPane.inputs.one.ticker.html(twoVal)
            SwapPane.inputs.two.ticker.html(oneVal)

            SwapPane.inputs.one.contract.html(contractTwo)
            SwapPane.inputs.two.contract.html(contactOne)

            elem.getElementsByTagName("img")[0].src = img2
            elem2.getElementsByTagName("img")[0].src = img1
            document.getElementById("swapReviewSelectedTokenImg").src = img2

            $("#swapTicker1").html(swapTicker2)
            $("#swapTicker2").html(swapTicker1)

            const svg1 = document.getElementById("selectedTokenSvg1").innerHTML
            const svg2 = document.getElementById("selectedTokenSvg2").innerHTML

            const svg1Disp = document.getElementById("selectedTokenSvg1").style.display
            const svg2Disp = document.getElementById("selectedTokenSvg2").style.display

            document.getElementById("selectedTokenSvg1").innerHTML = svg2
            document.getElementById("swapReviewSelectedTokenSvg").innerHTML = svg2
            document.getElementById("selectedTokenSvg2").innerHTML = svg1

            document.getElementById("selectedTokenSvg1").style.display = svg2Disp
            document.getElementById("swapReviewSelectedTokenSvg").style.display = svg2Disp
            document.getElementById("selectedTokenSvg2").style.display = svg1Disp
        })

        SwapPane.initBtn.click(function () {
            if (SwapPane.inputs.one.input.val() == "") return

            SwapPane.params.hide()
            SwapPane.loading.show()

            SwapPane.review.amountIn.html(SwapPane.inputs.one.input.val())
            SwapPane.review.inTicker.html(SwapPane.inputs.one.ticker.html())

            SwapPane.review.amountOut.html(SwapPane.inputs.two.input.val())
            SwapPane.review.outTicker.html(SwapPane.inputs.two.ticker.html())

            estimateSwapFees(SwapPane.inputs.one.input.val(), _this.route.route).then(function (res) {
                getGasPrice().then(function (gp) {
                    SwapPane.review.swapFees.html(Utils.precisionRound(parseFloat(SwapPane.inputs.one.input.val()) * res.feesRate, 9))
                    SwapPane.review.swapFeesTicker.html(SwapPane.inputs.one.ticker.html())

                    SwapPane.review.networkFeesTicker.html(MAIN_ASSET.ticker)

                    let editFees = document.querySelector("edit-fees")

                    _this.gasPrice = gp

                    editFees.onGasChanged = (gasPrice, gasLimit) => {
                        getBalance(MAIN_ASSET.ticker).then(function(mainBal){

                            _this.gasPrice = gasPrice

                            let totalNative = Number(Utils.formatAmount(gasLimit * gasPrice, mainBal.decimals))

                            if (MAIN_ASSET.ticker == SwapPane.inputs.one.contract.html())
                                totalNative += Number(amount)

                            if (totalNative <=  Utils.formatAmount(mainBal.balance, mainBal.decimals)){
                                $("#confirmSwapBtn").find("val").html("Init swap")
                                $("#confirmSwapBtn").attr("disabled", false)
                            }else{
                                $("#confirmSwapBtn").find("val").html("Insufficient " + MAIN_ASSET.ticker + " balance")
                                $("#confirmSwapBtn").attr("disabled", true)
                            }

                            $("#swapReviewNetFees").html(Utils.formatAmount(gasLimit * gasPrice, mainBal.decimals))
                        })
                    }

                    editFees.start(res.gas)
                    editFees.onGasChanged(gp, res.gas)

                    SwapPane.loading.hide()
                    SwapPane.review.self.show()
                })
            })

        })

        SwapPane.review.back.click(function () {
            clearInterval(_this.feesInterval)
            SwapPane.review.self.hide()
            SwapPane.params.show()
        })

        SwapPane.review.confirmBtn.click(function () {
            disableLoadBtn(SwapPane.review.confirmBtn)
            initSwap(SwapPane.review.amountIn.html(), _this.route.route, _this.gasPrice)
                .then(function () {
                    SwapPane.inputs.one.input.val("")
                    SwapPane.inputs.two.input.val("")
                    SwapPane.inputs.one.input.trigger("input")
                    enableLoadBtn(SwapPane.review.confirmBtn)
                    SwapPane.review.back.click()
                    notyf.success("Swap initiated!")
                })
        })

        events.addListener("chainChanged", data => {
            SwapPane.review.self.hide()
            _this.resetInputs()
            _this.setSwap(data)
        })

        setInterval(function () {
            _this.updateBalance(SwapPane.inputs.one)
            _this.updateBalance(SwapPane.inputs.two)
        }, 500)

        setInterval(function () {
            _this.checkAmount()
        }, 5000)

        $(".editFees").click(function (){
            $("#editfees").show()
        })

    }

    setSwap(data) {
        const selectedAddress = data.addresses[data.selectedAddress]
        const selectedWallet = data.wallets[data.selectedWallet].wallet

        if (selectedWallet.swapParams != false) {
            SwapPane.params.show()
            SwapPane.comingSoon.hide()
        } else {
            SwapPane.params.hide()
            SwapPane.comingSoon.show()
            return
        }

        this.updateSwap(data)
    }

    updateSwap(data) {
        this.updateBalance(SwapPane.inputs.one)
        this.updateBalance(SwapPane.inputs.two)
        SwapPane.inputs.one.input.trigger("input")
    }

    resetInputs(){
        SwapPane.inputs.one.input.val("")
        SwapPane.inputs.two.input.val("")
        document.getElementById("selectedTokenTicker1").innerHTML = "Select"
        document.getElementById("swapTicker1").innerHTML = ""
        document.getElementById("sendContract").innerHTML = ""
        document.getElementById("swapBalance1").innerHTML = "-"
        document.getElementById("imgDiv1").style.display = "none"
        $("#tokenSelect1").attr("class", "col-9 justify-content-center align-self-center p-0")

        document.getElementById("selectedTokenTicker2").innerHTML = "Select"
        document.getElementById("swapTicker2").innerHTML = ""
        document.getElementById("sendContract2").innerHTML = ""
        document.getElementById("swapBalance2").innerHTML = "-"
        document.getElementById("imgDiv2").style.display = "none"
        $("#tokenSelect2").attr("class", "col-9 justify-content-center align-self-center p-0")

        SwapPane.initBtn.attr("disabled", true)
    }

    updateBalance(elem, bypassLoading = false) {
        if (elem.ticker.html() === "Select") return

        getBalance(elem.contract.html()).then(function (res) {
            elem.ticker.html(res.ticker)
            elem.rateTicker.html(res.ticker)
            elem.btnTicker.html(res.ticker)
            elem.balance.html(Utils.formatAmount(res.balance, res.decimals))
        })
    }

    checkAmount() {
        if(SwapPane.inputs.one.contract.html() == "" || SwapPane.inputs.two.contract.html() == "") return

        SwapPane.inputs.two.input.val("")
        SwapPane.rate.self.hide()
        SwapPane.rate.notFound.hide()
        SwapPane.initBtn.attr("disabled", true)

        const _this = this

        const intAmnt = parseFloat(SwapPane.inputs.one.input.val())
        if (isNaN(intAmnt) || intAmnt <= 0 || SwapPane.inputs.one.ticker.html() == "" || SwapPane.inputs.two.ticker.html() == "") {
            SwapPane.rate.loading.css("visibility", "hidden")
            return
        }

        const amount = SwapPane.inputs.one.input.val()
        const token1 = SwapPane.inputs.one.contract.html()
        const token2 = SwapPane.inputs.two.contract.html()

        SwapPane.rate.loading.css("visibility", "visible")

        getSwapRoute(amount, token1, token2).then(function (res) {
            getBalance(token2).then(function (t2Bal) {
                //if entry has changed while calculating route then ignore
                if (amount != SwapPane.inputs.one.input.val() || token1 != SwapPane.inputs.one.contract.html() || token2 != SwapPane.inputs.two.contract.html())
                    return

                _this.route = res

                SwapPane.rate.loading.css("visibility", "hidden")

                if (res === false) {
                    SwapPane.rate.notFound.show()
                    return
                }

                SwapPane.rate.self.show()

                const amountOut = parseInt(res.amount)

                SwapPane.inputs.two.input.val(amountOut / 10 ** t2Bal.decimals)
                SwapPane.rate.amount.html((amountOut / 10 ** t2Bal.decimals) / SwapPane.inputs.one.input.val())

                SwapPane.review.amountOut.html(SwapPane.inputs.two.input.val())

                if (parseFloat(SwapPane.inputs.one.input.val()) <= parseFloat(SwapPane.inputs.one.balance.html()))
                    SwapPane.initBtn.attr("disabled", false)
            })
        })
    }

    }


const swapPane = new SwapPane()