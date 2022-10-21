class SwapPane {

    static inputs = {
        one: {
            input: $("#swapInput1"),
            select: $("#swapSelect1"),
            ticker: $("#swapTicker1"),
            rateTicker: $("#swapRateTicker1"),
            balance: $("#swapBalance1"),
            btnTicker: $("#swapBtnTicker1"),
            btnMax: $("#swapMaxBtn1")
        },
        two: {
            input: $("#swapInput2"),
            select: $("#swapSelect2"),
            ticker: $("#swapTicker2"),
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

    constructor() {
        this.select1OldElem = ""
        this.select2OldElem = ""

        const _this = this

        SwapPane.inputs.one.select.change(function(){
            swapPane.updateSelects(1)
            _this.updateBalance(SwapPane.inputs.one)
            SwapPane.inputs.one.input.trigger("input")
        })

        SwapPane.inputs.two.select.change(function(){
            swapPane.updateSelects(2)
            _this.updateBalance(SwapPane.inputs.two)
            SwapPane.inputs.one.input.trigger("input")
        })

        SwapPane.inputs.one.input.on("input", function(){
            _this.checkAmount()
        })

        SwapPane.inputs.one.btnMax.click(function(){
            if(SwapPane.inputs.one.select.val() == "" || isNaN(SwapPane.inputs.one.balance.html())) return
            SwapPane.inputs.one.input.val(SwapPane.inputs.one.balance.html())
            SwapPane.inputs.one.input.trigger("input")
        })

        SwapPane.switchBtn.click(function(){
            const oneVal = SwapPane.inputs.one.select.val()
            const twoVal = SwapPane.inputs.two.select.val()

            SwapPane.inputs.one.select.val("")
            SwapPane.inputs.two.select.val("")

            SwapPane.inputs.one.select.trigger("change")
            SwapPane.inputs.two.select.trigger("change")

            SwapPane.inputs.one.select.val(twoVal)
            SwapPane.inputs.two.select.val(oneVal)

            SwapPane.inputs.one.select.trigger("change")
            SwapPane.inputs.two.select.trigger("change")
        })

        SwapPane.initBtn.click(function(){
            if(SwapPane.inputs.one.input.val() == "") return

            SwapPane.params.hide()
            SwapPane.loading.show()

            SwapPane.review.amountIn.html(SwapPane.inputs.one.input.val())
            SwapPane.review.inTicker.html(SwapPane.inputs.one.ticker.html())

            SwapPane.review.amountOut.html(SwapPane.inputs.two.input.val())
            SwapPane.review.outTicker.html(SwapPane.inputs.two.ticker.html())

            estimateSwapFees(SwapPane.inputs.one.input.val(), _this.route.route).then(function(res){
                SwapPane.review.swapFees.html(Utils.precisionRound(parseFloat(SwapPane.inputs.one.input.val())*res.feesRate, 9))
                SwapPane.review.swapFeesTicker.html(SwapPane.inputs.one.ticker.html())

                SwapPane.review.networkFeesTicker.html(MAIN_ASSET.ticker)

                _this.estimateFees = function(){
                    getGasPrice().then(function(gasPrice){
                        getBalance(MAIN_ASSET.ticker).then(function (nativeBalance) {
                            let feesModifier = 0.5 + SwapPane.review.rangeFees.val() / 100

                            SwapPane.review.networkFees.html(Utils.formatAmount(res.gas * Math.round(gasPrice * feesModifier), MAIN_ASSET.decimals))

                            _this.gasPrice = Math.round(gasPrice * feesModifier)

                            let totalForNative = new BN(res.gas).mul(new BN(_this.gasPrice))
                            if (_this.route.route[0] == MAIN_ASSET.contract)
                                totalForNative = totalForNative.add(new BN(Utils.toAtomicString(SwapPane.inputs.one.input.val(), MAIN_ASSET.decimals)))

                            if (totalForNative.lte(new BN(nativeBalance.balance)) && !isBtnDisabled(SwapPane.review.confirmBtn)){
                                SwapPane.review.confirmBtn.attr("disabled", false)
                                SwapPane.review.confirmBtn.find("val").html("Init swap")
                            }else{
                                SwapPane.review.confirmBtn.attr("disabled", true)
                                SwapPane.review.confirmBtn.find("val").html("Insufficient " + MAIN_ASSET.ticker)
                            }

                            if(SwapPane.review.amountOut.html() != SwapPane.inputs.two.input.val() && SwapPane.inputs.two.input.val() != "")
                                SwapPane.review.amountOut.html(SwapPane.inputs.two.input.val())

                            SwapPane.loading.hide()
                            if(!isBtnDisabled(SwapPane.review.confirmBtn) && !SwapPane.params.is(":visible"))
                                SwapPane.review.self.show()
                        })
                    })
                }

                _this.estimateFees()
                _this.feesInterval = setInterval(function(){
                    _this.estimateFees()
                }, 2500)

            })

        })

        SwapPane.review.rangeFees.on("input", function(){
            _this.estimateFees()
        })

        SwapPane.review.back.click(function(){
            clearInterval(_this.feesInterval)
            SwapPane.review.self.hide()
            SwapPane.params.show()
        })

        SwapPane.review.confirmBtn.click(function (){
            disableLoadBtn(SwapPane.review.confirmBtn)
            initSwap(SwapPane.review.amountIn.html(), _this.route.route, _this.gasPrice)
                .then(function(){
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

    }

    setSwap(data){
        const selectedAddress = data.addresses[data.selectedAddress]
        const selectedWallet = data.wallets[data.selectedWallet].wallet

        if(selectedWallet.swapParams != false){
            SwapPane.params.show()
            SwapPane.comingSoon.hide()
        }else{
            SwapPane.params.hide()
            SwapPane.comingSoon.show()
            return
        }

        this.setSelectOptions(SwapPane.inputs.one, selectedAddress.balances)
        this.setSelectOptions(SwapPane.inputs.two, selectedAddress.balances)
        this.updateSwap(data)
    }

    updateSwap(data){
        this.updateBalance(SwapPane.inputs.one)
        this.updateBalance(SwapPane.inputs.two)
        SwapPane.inputs.one.input.trigger("input")
    }

    setSelectOptions(input, balances){
        input.select.html("")

        this.select1OldElem = ""
        this.select2OldElem = ""

        Object.entries(balances).map(([contractAddr, balance]) => {
            let elem = $("<option></option>")
            elem.val(contractAddr)
            elem.html(balance.ticker)

            if(MAIN_ASSET.contract == balance.contract)
                elem.attr("data-content",
                    '<div class="selectLogo" style="background-image: url(https://raw.githubusercontent.com/virgoproject/tokens/main/'+MAIN_ASSET.ticker+'/'+MAIN_ASSET.ticker+'/logo.png);"></div><span class="selectText">'+MAIN_ASSET.ticker+'</span>')
            else
                elem.attr("data-content",
                    '<div class="selectLogo" style="background-image: url(https://raw.githubusercontent.com/virgoproject/tokens/main/'+MAIN_ASSET.ticker+'/'+balance.contract+'/logo.png);"></div><span class="selectText">'+balance.ticker+'</span>')

            input.select.append(elem)
        })

        input.select.selectpicker('refresh');
    }

    //remove selected token in other list
    updateSelects(elem){
        if(elem == 1){
            if(this.select2OldElem != ""){
                SwapPane.inputs.two.select.append(this.select2OldElem.elem)
                this.select2OldElem.elem.insertIndex(this.select2OldElem.index)
            }
            if(SwapPane.inputs.one.select.val() == ""){
                this.select2OldElem = ""
                SwapPane.inputs.two.select.selectpicker('refresh')
                return
            }
            const oldElem = SwapPane.inputs.two.select.find('[value='+SwapPane.inputs.one.select.val()+']')
            this.select2OldElem = {
                elem: oldElem,
                index: oldElem.index()
            }
            this.select2OldElem.elem.remove()
            SwapPane.inputs.two.select.selectpicker('refresh')
        }else{
            if(this.select1OldElem != ""){
                SwapPane.inputs.one.select.append(this.select1OldElem.elem)
                this.select1OldElem.elem.insertIndex(this.select1OldElem.index)
            }
            if(SwapPane.inputs.two.select.val() == ""){
                this.select1OldElem = ""
                SwapPane.inputs.one.select.selectpicker('refresh')
                return
            }
            const oldElem = SwapPane.inputs.one.select.find('[value='+SwapPane.inputs.two.select.val()+']')
            this.select1OldElem = {
                elem: oldElem,
                index: oldElem.index()
            }
            this.select1OldElem.elem.remove()
            SwapPane.inputs.one.select.selectpicker('refresh')
        }

    }

    updateBalance(elem, bypassLoading = false){
        if(elem.select.val() == ""){
            elem.ticker.html("")

            if(elem.select.val() == "") {
                elem.balance.html("-")
                elem.btnTicker.html("-")
                elem.rateTicker.html("-")
                return
            }
            return
        }

        if(!bypassLoading){
            elem.ticker.html("")

            if(elem.select.val() == "") {
                elem.balance.html("-")
                elem.btnTicker.html("-")
                elem.rateTicker.html("-")
                return
            }

            elem.balance.html("<i class='fas fa-spinner fa-pulse'></i>")
        }

        getBalance(elem.select.val()).then(function(res){
            elem.ticker.html(res.ticker)
            elem.rateTicker.html(res.ticker)
            elem.btnTicker.html(res.ticker)
            elem.balance.html(Utils.formatAmount(res.balance, res.decimals))
        })
    }

    checkAmount(){
        SwapPane.inputs.two.input.val("")
        SwapPane.rate.route.hide()
        SwapPane.rate.self.hide()
        SwapPane.rate.notFound.hide()
        SwapPane.initBtn.attr("disabled", true)

        const _this = this

        const intAmnt = parseFloat(SwapPane.inputs.one.input.val())
        if(isNaN(intAmnt) || intAmnt <= 0 || SwapPane.inputs.one.select.val() == "" || SwapPane.inputs.two.select.val() == ""){
            SwapPane.rate.loading.hide()
            return
        }

        const amount = SwapPane.inputs.one.input.val()
        const token1 = SwapPane.inputs.one.select.val()
        const token2 = SwapPane.inputs.two.select.val()

        SwapPane.rate.loading.show()

        getSwapRoute(amount, token1, token2).then(function(res){
            getBalance(token2).then(function(t2Bal) {
                //if entry has changed while calculating route then ignore
                if (amount != SwapPane.inputs.one.input.val() || token1 != SwapPane.inputs.one.select.val() || token2 != SwapPane.inputs.two.select.val())
                    return

                _this.route = res

                SwapPane.rate.loading.hide()

                if(res === false){
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
                SwapPane.rate.amount.html((amountOut / 10 ** t2Bal.decimals)/SwapPane.inputs.one.input.val())

                if(parseFloat(SwapPane.inputs.one.input.val()) <= parseFloat(SwapPane.inputs.one.balance.html()))
                    SwapPane.initBtn.attr("disabled", false)

                if(_this.checkAmountTimeout !== undefined)
                    clearTimeout(_this.checkAmountTimeout)

                _this.checkAmountTimeout = setTimeout(function(){
                    _this.checkAmount()
                }, 10000)
            })
        })
    }

}

const swapPane = new SwapPane()
