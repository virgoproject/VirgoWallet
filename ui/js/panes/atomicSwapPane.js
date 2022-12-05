class AtomicSwapPane {

    static self = $("#atomicSwapPane")
    static back = $("#atomicSwapBack")
    static inputs = {
        one: {
            input: $("#atomicSwapInput1"),
            select: $("#atomicSwapSelect1"),
            ticker: $("#atomicSwapTicker1"),
            rateTicker: $("#atomicSwapRateTicker1"),
            balance: $("#atomicSwapBalance1"),
            btnTicker: $("#atomicSwapBtnTicker1"),
            btnMax: $("#atomicSwapMaxBtn1")
        },
        two: {
            input: $("#atomicSwapInput2"),
            select: $("#atomicSwapSelect2"),
            ticker: $("#atomicSwapTicker2"),
            rateTicker: $("#atomicSwapRateTicker2"),
            balance: $("#atomicSwapBalance2"),
            btnTicker: $("#atomicSwapBtnTicker2")
        }
    }
    static rate = {
        self: $("#atomicSwapRate"),
        loading: $("#atomicSwapRateLoading"),
        amount: $("#atomicSwapRateAmount"),
        route: $("#atomicSwapRoute"),
        routeBaseStep: $("#atomicSwapRouteBaseStep"),
        maxErr: {
            self: $("#atomicSwapMaxErr"),
            amount: $("#atomicSwapMaxErr amount"),
            ticker: $("#atomicSwapMaxErr ticker")
        },
        minErr: {
            self: $("#atomicSwapMinErr"),
            amount: $("#atomicSwapMinErr amount"),
            ticker: $("#atomicSwapMinErr ticker")
        }
    }
    static params = $("#atomicSwapParams")
    static switchBtn = $("#atomicSwapSwitchBtn")
    static initBtn = $("#initAtomicSwapBtn")
    static loading = $("#atomicSwapLoading")
    static review = {
        networkFeesTicker: $("#atomicSwapReviewNetFeesTicker"),
        rangeFees: $("#atomicSwapRangeFees"),
        networkFees: $("#atomicSwapReviewNetFees"),
        self: $("#atomicSwapReview"),
        amountIn: $("#atomicSwapReviewAmountIn"),
        inTicker: $("#atomicSwapReviewTickerIn"),
        amountOut: $("#atomicSwapReviewAmountOut"),
        outTicker: $("#atomicSwapReviewTickerOut"),
        confirmBtn: $("#confirmAtomicSwapBtn"),
        back: $("#atomicSwapReviewBack")
    }
    static accessOne = $("#atomicSwapAccess1")

    constructor() {
        this.select1OldElem = ""
        this.select2OldElem = ""

        const _this = this

        AtomicSwapPane.back.click(() => {
            AtomicSwapPane.self.hide()
        })

        AtomicSwapPane.inputs.one.select.change(function(){
            atomicSwap.updateSelects(1)
            _this.updateBalance(AtomicSwapPane.inputs.one)
            AtomicSwapPane.inputs.one.input.trigger("input")
        })

        AtomicSwapPane.inputs.two.select.change(function(){
            atomicSwap.updateSelects(2)
            _this.updateBalance(AtomicSwapPane.inputs.two)
            AtomicSwapPane.inputs.one.input.trigger("input")
        })

        AtomicSwapPane.inputs.one.input.on("input", function(){
            _this.checkAmount()
        })

        AtomicSwapPane.switchBtn.click(function(){
            const oneVal = AtomicSwapPane.inputs.one.select.val()
            const twoVal = AtomicSwapPane.inputs.two.select.val()

            AtomicSwapPane.inputs.one.select.val("")
            AtomicSwapPane.inputs.two.select.val("")

            AtomicSwapPane.inputs.one.select.trigger("change")
            AtomicSwapPane.inputs.two.select.trigger("change")

            AtomicSwapPane.inputs.one.select.val(twoVal)
            AtomicSwapPane.inputs.two.select.val(oneVal)

            AtomicSwapPane.inputs.one.select.trigger("change")
            AtomicSwapPane.inputs.two.select.trigger("change")
        })

        AtomicSwapPane.initBtn.click(() => {
            if(AtomicSwapPane.inputs.one.input.val() == "") return

            AtomicSwapPane.params.hide()
            AtomicSwapPane.loading.show()

            AtomicSwapPane.review.amountIn.html(AtomicSwapPane.inputs.one.input.val())
            AtomicSwapPane.review.inTicker.html(AtomicSwapPane.inputs.one.ticker.html())

            AtomicSwapPane.review.amountOut.html(AtomicSwapPane.inputs.two.input.val())
            AtomicSwapPane.review.outTicker.html(AtomicSwapPane.inputs.two.ticker.html())

            AtomicSwapPane.review.networkFeesTicker.html(AtomicSwapPane.inputs.one.select.val())

            _this.estimateFees = () => {
                const oneChainID = $('option:selected', AtomicSwapPane.inputs.one.select).attr('chainID')

                estimateAtomicSwapFees(oneChainID).then(res => {

                    getBalanceCross(oneChainID, AtomicSwapPane.inputs.one.select.val()).then(function(res2){

                        let feesModifier = 0.5 + AtomicSwapPane.review.rangeFees.val() / 100

                        AtomicSwapPane.review.networkFees.html(Utils.formatAmount(res.gas * Math.round(res.gasPrice * feesModifier), res2.decimals))

                        _this.gasPrice = Math.round(res.gasPrice * feesModifier)

                        let totalForNative = new BN(res.gas).mul(new BN(_this.gasPrice))
                        totalForNative = totalForNative.add(new BN(Utils.toAtomicString(AtomicSwapPane.inputs.one.input.val(), res2.decimals)))

                        if (totalForNative.lte(new BN(res2.balance)) && !isBtnDisabled(AtomicSwapPane.review.confirmBtn)){
                            AtomicSwapPane.review.confirmBtn.attr("disabled", false)
                            AtomicSwapPane.review.confirmBtn.find("val").html("Init swap")
                        }else{
                            AtomicSwapPane.review.confirmBtn.attr("disabled", true)
                            AtomicSwapPane.review.confirmBtn.find("val").html("Insufficient " + MAIN_ASSET.ticker)
                        }

                        if(AtomicSwapPane.review.amountOut.html() != AtomicSwapPane.inputs.two.input.val() && AtomicSwapPane.inputs.two.input.val() != "")
                            AtomicSwapPane.review.amountOut.html(AtomicSwapPane.inputs.two.input.val())

                        AtomicSwapPane.loading.hide()
                        if(!isBtnDisabled(AtomicSwapPane.review.confirmBtn) && !AtomicSwapPane.params.is(":visible"))
                            AtomicSwapPane.review.self.show()

                    })

                })
            }

            _this.estimateFees()
            _this.feesInterval = setInterval(function(){
                _this.estimateFees()
            }, 2500)

        })

        AtomicSwapPane.review.rangeFees.on("input", function(){
            _this.estimateFees()
        })

        AtomicSwapPane.review.back.click(function(){
            clearInterval(_this.feesInterval)
            AtomicSwapPane.review.self.hide()
            AtomicSwapPane.params.show()
        })

        AtomicSwapPane.review.confirmBtn.click(function (){
            disableLoadBtn(AtomicSwapPane.review.confirmBtn)
            initAtomicSwap(AtomicSwapPane.review.amountIn.html(), $('option:selected', AtomicSwapPane.inputs.one.select).attr('chainID'), $('option:selected', AtomicSwapPane.inputs.two.select).attr('chainID'), _this.gasPrice)
                .then(function(){
                    AtomicSwapPane.inputs.one.input.val("")
                    AtomicSwapPane.inputs.two.input.val("")
                    AtomicSwapPane.inputs.one.input.trigger("input")
                    enableLoadBtn(AtomicSwapPane.review.confirmBtn)
                    AtomicSwapPane.review.back.click()
                    notyf.success("Atomic swap initiated!")
                })
        })

        AtomicSwapPane.accessOne.click(() => {
            SelectChains.header.click()
            AtomicSwapPane.self.show()
        })

    }

    setAtomicSwap(data){
        this.setSelectOptions(AtomicSwapPane.inputs.one, data)
        this.setSelectOptions(AtomicSwapPane.inputs.two, data)
    }

    setSelectOptions(input, data){
        input.select.html("")

        for(let wallet of data.wallets){
            wallet = wallet.wallet

            if(wallet.chainID != 1 && wallet.chainID != 56 && wallet.chainID != 137) continue

            if(wallet.testnet)
                continue

            let elem = $("<option></option>")
            elem.val(wallet.ticker)
            elem.html(wallet.ticker)
            elem.attr("chainID", wallet.chainID)
            elem.attr("decimals", wallet.decimals)

            elem.attr("data-content",
                '<div class="selectLogo" style="background-image: url(https://raw.githubusercontent.com/virgoproject/tokens/main/'+wallet.ticker+'/'+wallet.ticker+'/logo.png);"></div><span class="selectText">'+wallet.ticker+'</span>')

            input.select.append(elem)
        }

        input.select.selectpicker('refresh')
    }

    //remove selected token in other list
    updateSelects(elem){
        if(elem == 1){
            if(this.select2OldElem != ""){
                AtomicSwapPane.inputs.two.select.append(this.select2OldElem.elem)
                this.select2OldElem.elem.insertIndex(this.select2OldElem.index)
            }
            if(AtomicSwapPane.inputs.one.select.val() == ""){
                this.select2OldElem = ""
                AtomicSwapPane.inputs.two.select.selectpicker('refresh')
                return
            }
            const oldElem = AtomicSwapPane.inputs.two.select.find('[value='+AtomicSwapPane.inputs.one.select.val()+']')
            this.select2OldElem = {
                elem: oldElem,
                index: oldElem.index()
            }
            this.select2OldElem.elem.remove()
            AtomicSwapPane.inputs.two.select.selectpicker('refresh')
        }else{
            if(this.select1OldElem != ""){
                AtomicSwapPane.inputs.one.select.append(this.select1OldElem.elem)
                this.select1OldElem.elem.insertIndex(this.select1OldElem.index)
            }
            if(AtomicSwapPane.inputs.two.select.val() == ""){
                this.select1OldElem = ""
                AtomicSwapPane.inputs.one.select.selectpicker('refresh')
                return
            }
            const oldElem = AtomicSwapPane.inputs.one.select.find('[value='+AtomicSwapPane.inputs.two.select.val()+']')
            this.select1OldElem = {
                elem: oldElem,
                index: oldElem.index()
            }
            this.select1OldElem.elem.remove()
            AtomicSwapPane.inputs.one.select.selectpicker('refresh')
        }

    }

    updateBalance(elem, bypassLoading = false){
        if(elem.select.val() == "") return

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

        getBalanceCross($('option:selected', elem.select).attr('chainID'), elem.select.val()).then(function(res){
            elem.ticker.html(res.ticker)
            elem.rateTicker.html(res.ticker)
            elem.btnTicker.html(res.ticker)
            elem.balance.html(Utils.formatAmount(res.balance, res.decimals))
        })
    }

    checkAmount(){
        AtomicSwapPane.inputs.two.input.val("")
        AtomicSwapPane.rate.self.hide()
        AtomicSwapPane.rate.maxErr.self.hide()
        AtomicSwapPane.rate.minErr.self.hide()
        AtomicSwapPane.initBtn.attr("disabled", true)

        const _this = this

        const intAmnt = parseFloat(AtomicSwapPane.inputs.one.input.val())
        if(isNaN(intAmnt) || intAmnt <= 0 || AtomicSwapPane.inputs.one.select.val() == "" || AtomicSwapPane.inputs.two.select.val() == ""){
            AtomicSwapPane.rate.loading.hide()
            return
        }

        const amount = AtomicSwapPane.inputs.one.input.val()
        const token1 = AtomicSwapPane.inputs.one.select.val()
        const token2 = AtomicSwapPane.inputs.two.select.val()

        const amntAtomic = Utils.toAtomicString(amount, $('option:selected', AtomicSwapPane.inputs.one.select).attr('decimals'))

        AtomicSwapPane.rate.loading.show()

        fetch("https://atomicswap.virgo.net:2083/api/quote/"+token1+"/"+token2+"/"+amntAtomic).then(res => {
            res.json().then(json => {
                if (amount != AtomicSwapPane.inputs.one.input.val() || token1 != AtomicSwapPane.inputs.one.select.val() || token2 != AtomicSwapPane.inputs.two.select.val())
                    return

                if(_this.checkAmountTimeout !== undefined)
                    clearTimeout(_this.checkAmountTimeout)

                _this.checkAmountTimeout = setTimeout(function(){
                    _this.checkAmount()
                }, 10000)

                AtomicSwapPane.rate.loading.hide()

                AtomicSwapPane.inputs.two.input.val(Utils.formatAmount(json.amountOut, $('option:selected', AtomicSwapPane.inputs.two.select).attr('decimals')))

                if(new BN(json.max).lt(new BN(amntAtomic))){
                    AtomicSwapPane.rate.maxErr.amount.html(Utils.formatAmount(json.max, $('option:selected', AtomicSwapPane.inputs.one.select).attr('decimals')))
                    AtomicSwapPane.rate.maxErr.ticker.html(token1)
                    AtomicSwapPane.rate.maxErr.self.show()
                    return
                }else if(new BN(json.min).gt(new BN(amntAtomic))){
                    AtomicSwapPane.rate.minErr.amount.html(Utils.formatAmount(json.min, $('option:selected', AtomicSwapPane.inputs.one.select).attr('decimals')))
                    AtomicSwapPane.rate.minErr.ticker.html(token1)
                    AtomicSwapPane.rate.minErr.self.show()
                    return
                }

                if(parseFloat(AtomicSwapPane.inputs.one.input.val()) <= parseFloat(AtomicSwapPane.inputs.one.balance.html()))
                    AtomicSwapPane.initBtn.attr("disabled", false)

            })
        })
    }

}

atomicSwap = new AtomicSwapPane()
