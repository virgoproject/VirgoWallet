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
        notFound: {
            self: $("#atomicSwapRouteNotFound"),
            amount: $("#atomicSwapRouteNotFound amount"),
            ticker: $("#atomicSwapRouteNotFound ticker")
        }
    }
    static params = $("#atomicSwapParams")
    static switchBtn = $("#atomicSwapSwitchBtn")
    static initBtn = $("#initAtomicSwapBtn")
    static loading = $("#atomicSwapLoading")

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
        AtomicSwapPane.rate.notFound.self.hide()
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

        fetch("http://localhost/api/quote/"+token1+"/"+token2+"/"+amntAtomic).then(res => {
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
                    AtomicSwapPane.rate.notFound.amount.html(Utils.formatAmount(json.max, $('option:selected', AtomicSwapPane.inputs.one.select).attr('decimals')))
                    AtomicSwapPane.rate.notFound.ticker.html(token1)
                    AtomicSwapPane.rate.notFound.self.show()
                    return
                }

                if(parseFloat(AtomicSwapPane.inputs.one.input.val()) <= parseFloat(AtomicSwapPane.inputs.one.balance.html()))
                    AtomicSwapPane.initBtn.attr("disabled", false)

            })
        })
    }

}

atomicSwap = new AtomicSwapPane()
