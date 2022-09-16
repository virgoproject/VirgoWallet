class SwapPane {

    static inputs = {
        one: {
            input: $("#swapInput1"),
            select: $("#swapSelect1"),
            ticker: $("#swapTicker1"),
            balance: $("#swapBalance1"),
            btnTicker: $("#swapBtnTicker1"),
            btnMax: $("#swapMaxBtn1")
        },
        two: {
            input: $("#swapInput2"),
            select: $("#swapSelect2"),
            ticker: $("#swapTicker2"),
            balance: $("#swapBalance2"),
            btnTicker: $("#swapBtnTicker2")
        }
    }
    static rate = {
        loading: $("#swapRateLoading")
    }

    constructor() {
        this.select1OldElem = ""
        this.select2OldElem = ""
    }

    setSwap(data){
        const selectedAddress = data.addresses[data.selectedAddress]

        this.setSelectOptions(SwapPane.inputs.one, selectedAddress.balances)
        this.setSelectOptions(SwapPane.inputs.two, selectedAddress.balances)

        const _this = this

        SwapPane.inputs.one.select.change(function(){
            swapPane.updateSelects(1)
            _this.updateBalance(SwapPane.inputs.one)
        })

        SwapPane.inputs.two.select.change(function(){
            swapPane.updateSelects(2)
            _this.updateBalance(SwapPane.inputs.two)
        })

        SwapPane.inputs.one.btnMax.click(function(){
            if(SwapPane.inputs.one.select.val() == "") return
            SwapPane.inputs.one.input.val(SwapPane.inputs.one.balance.html())
            SwapPane.inputs.one.input.trigger("input")
        })

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
        if(elem == 1){
            if(this.select2OldElem != ""){
                SwapPane.inputs.two.select.append(this.select2OldElem.elem)
                this.select2OldElem.elem.insertIndex(this.select2OldElem.index)
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
        if(elem.select.val() == "") return

        elem.ticker.html("")
        elem.balance.html("<i class='fas fa-spinner fa-pulse'></i>")

        getBalance(elem.select.val()).then(function(res){
            elem.ticker.html(res.ticker)
            elem.btnTicker.html(res.ticker)
            elem.balance.html(Utils.formatAmount(res.balance, res.decimals))
        })
    }

    checkAmount(){
        SwapPane.rate.loading.show()
    }

}

const swapPane = new SwapPane()
