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
        routeBaseStep: $("#swapRouteBaseStep")
    }
    static params = $("#swapParams")
    static switchBtn = $("#swapSwitchBtn")
    static initBtn = $("#initSwapBtn")
    static loading = $("#swapLoading")

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
            if(SwapPane.inputs.one.select.val() == "") return
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
            SwapPane.params.hide()
            SwapPane.loading.show()
        })
    }

    setSwap(data){

        const selectedAddress = data.addresses[data.selectedAddress]

        this.setSelectOptions(SwapPane.inputs.one, selectedAddress.balances)
        this.setSelectOptions(SwapPane.inputs.two, selectedAddress.balances)
    }

    setSelectOptions(input, balances){
        input.select.html("")

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
        console.log(this.select2OldElem)
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

    updateBalance(elem){
        elem.ticker.html("")

        if(elem.select.val() == "") {
            elem.balance.html("-")
            elem.btnTicker.html("-")
            elem.rateTicker.html("-")
            return
        }

        elem.balance.html("<i class='fas fa-spinner fa-pulse'></i>")

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
        SwapPane.initBtn.attr("disabled", true)

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

                SwapPane.rate.loading.hide()

                SwapPane.rate.route.html("")
                for (const step of res.route) {
                    const elem = SwapPane.rate.routeBaseStep.clone()
                    if (step == MAIN_ASSET.contract)
                        elem.css("background-image", "url(https://raw.githubusercontent.com/virgoproject/tokens/main/" + MAIN_ASSET.ticker + "/" + MAIN_ASSET.ticker + "/logo.png)")
                    else
                        elem.css("background-image", "url(https://raw.githubusercontent.com/virgoproject/tokens/main/" + MAIN_ASSET.ticker + "/" + step + "/logo.png)")
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

                const amountOut = parseInt(res.amount, 16)

                SwapPane.inputs.two.input.val(amountOut / 10 ** t2Bal.decimals)
                SwapPane.rate.amount.html((amountOut / 10 ** t2Bal.decimals)/SwapPane.inputs.one.input.val())

                if(SwapPane.inputs.one.input.val() <= SwapPane.inputs.one.balance.html())
                    SwapPane.initBtn.attr("disabled", false)
            })
        })
    }

}

const swapPane = new SwapPane()
