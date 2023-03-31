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
            btnSelect: $("#tokenSelectBtn"),
            img: $("#selectedTokenImg"),
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
        route: $("#swapRoute"),
        routeBaseStep: $("#swapRouteBaseStep"),
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


        SwapPane.inputs.one.btnMax.click(function () {
            if (SwapPane.inputs.one.btnSelect.html() == "" || isNaN(SwapPane.inputs.one.balance.html())) return
            SwapPane.inputs.one.input.val(SwapPane.inputs.one.balance.html())
            SwapPane.inputs.one.input.trigger("input")
        })

        SwapPane.inputs.one.btnSelect.click(function () {
            $("#tokenSelect").show()
            SwapPane.inputs.one.btnSelect.attr("class", "row tokenSelect one")
            tokenSelect.displayTokenSelect()
        })

        SwapPane.inputs.two.btnSelect.click(function () {
            $("#tokenSelect").show()
            SwapPane.inputs.two.btnSelect.attr("class", "row tokenSelect two")
            tokenSelect.displayTokenSelect()
        })

        $("#tokenBack").click(function () {
            $("#tokenSelect").hide()
        })

        SwapPane.switchBtn.click(function () {
            const elem = document.getElementById("tokenSelectBtn1")
            const elem2 = document.getElementById("tokenSelectBtn")

            const oneVal = SwapPane.inputs.one.ticker.html()
            const twoVal = SwapPane.inputs.two.ticker.html()

            const contactOne = SwapPane.inputs.one.contract.html()
            const contractTwo = SwapPane.inputs.two.contract.html()

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

            $("#swapTicker1").html(swapTicker2)
            $("#swapTicker2").html(swapTicker1)

            const selectedTokens = tokenSelect.selectedTokens1
            tokenSelect.selectedTokens1 = tokenSelect.selectedTokens2
            tokenSelect.selectedTokens2 = selectedTokens
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
                SwapPane.review.swapFees.html(Utils.precisionRound(parseFloat(SwapPane.inputs.one.input.val()) * res.feesRate, 9))
                SwapPane.review.swapFeesTicker.html(SwapPane.inputs.one.ticker.html())

                SwapPane.review.networkFeesTicker.html(MAIN_ASSET.ticker)


                let gas = res.gas
                let decimals = MAIN_ASSET.decimals
                let tag;
                tag = document.querySelector("edit-fees")
                const decimal = tag.dataset.decimal = decimals
                const lim = tag.dataset.limit = gas
                const tick = tag.dataset.ticker = MAIN_ASSET.ticker
                $(".feesTicker").html(tick)
                tag.start(gas)

                tag.onGasChanged = () => {
                    $("#swapReviewNetFees").html(Utils.formatAmount(gas * tag.getGas(), decimals))
                }
                tag.onBalance = () => {
                    $("#confirmSwapBtn .button").find("val").html("Send")
                    $("#confirmSwapBtn .button").attr("disabled", false)
                }


                if (SwapPane.review.amountOut.html() != SwapPane.inputs.two.input.val() && SwapPane.inputs.two.input.val() != "")
                    SwapPane.review.amountOut.html(SwapPane.inputs.two.input.val())

                SwapPane.loading.hide()
                if (!isBtnDisabled(SwapPane.review.confirmBtn) && !SwapPane.params.is(":visible"))
                    SwapPane.review.self.show()


            })

        })

        SwapPane.review.rangeFees.on("input", function () {
            _this.estimateFees()
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
            SwapPane.inputs.one.input.val("")
            SwapPane.review.self.hide()
            _this.setSwap(data)
        })

        setInterval(function () {
            if (SwapPane.inputs.one.ticker.html() !== "Select") {
                _this.updateBalance(SwapPane.inputs.one)
                _this.updateBalance(SwapPane.inputs.two)
            }
        }, 500)

        setInterval(function () {
            _this.checkAmount()
        }, 5000)
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


    updateBalance(elem, bypassLoading = false) {
        console.log(elem.ticker.html())

        getBalance(elem.contract.html()).then(function (res) {
            elem.ticker.html(res.ticker)
            elem.rateTicker.html(res.ticker)
            elem.btnTicker.html(res.ticker)
            elem.balance.html(Utils.formatAmount(res.balance, res.decimals))
        })
    }


    checkAmount() {
        SwapPane.inputs.two.input.val("")
        SwapPane.rate.route.hide()
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

                SwapPane.rate.route.html("")

                for (const step of res.route) {
                    const elem = SwapPane.rate.routeBaseStep.clone()
                    if (step.toLowerCase() == MAIN_ASSET.contract.toLowerCase())
                        elem.css("background-image", "url(https://raw.githubusercontent.com/virgoproject/tokens/main/" + MAIN_ASSET.ticker + "/" + MAIN_ASSET.ticker + "/logo.png)")
                    else
                        elem.css("background-image", "url(https://raw.githubusercontent.com/virgoproject/tokens/main/" + MAIN_ASSET.ticker + "/" + step + "/logo.png), url(https://raw.githubusercontent.com/virgoproject/tokens/main/" + MAIN_ASSET.ticker + "/" + step.toLowerCase() + "/logo.png)")
                    SwapPane.rate.route.append(elem)
                    elem.show()
                }
                SwapPane.rate.route
                    .removeClass("steps3")
                    .removeClass("steps4")
                    .removeClass("steps5")
                    .addClass("steps" + res.route.length)

                SwapPane.rate.route.show()
                SwapPane.rate.self.show()

                const amountOut = parseInt(res.amount)

                SwapPane.inputs.two.input.val(amountOut / 10 ** t2Bal.decimals)
                SwapPane.rate.amount.html((amountOut / 10 ** t2Bal.decimals) / SwapPane.inputs.one.input.val())

                if (parseFloat(SwapPane.inputs.one.input.val()) <= parseFloat(SwapPane.inputs.one.balance.html()))
                    SwapPane.initBtn.attr("disabled", false)

                if (_this.checkAmountTimeout !== undefined)
                    clearTimeout(_this.checkAmountTimeout)

                _this.checkAmountTimeout = setTimeout(function () {
                    _this.checkAmount()
                }, 10000)
            })
        })
    }

    }


const swapPane = new SwapPane()
