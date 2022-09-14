class SwapPane {

    static inputs = {
        select1: $("#swapSelect1"),
        select2: $("#swapSelect2")
    }

    constructor() {
        this.select1OldElem = ""
        this.select2OldElem = ""
    }

    setSwap(data){
        const selectedAddress = data.addresses[data.selectedAddress]

        this.setSelectOptions(SwapPane.inputs.select1, selectedAddress.balances)
        this.setSelectOptions(SwapPane.inputs.select2, selectedAddress.balances)

        SwapPane.inputs.select1.change(function(){
            swapPane.updateSelects(1)
        })

        SwapPane.inputs.select2.change(function(){
            swapPane.updateSelects(2)
        })
    }

    setSelectOptions(select, balances){
        select.html("")

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

            select.append(elem)
        })

        select.selectpicker('refresh');

    }

    //remove selected token in other list
    updateSelects(elem){
        if(elem == 1){
            if(this.select2OldElem != ""){
                SwapPane.inputs.select2.append(this.select2OldElem.elem)
                this.select2OldElem.elem.insertIndex(this.select2OldElem.index)
            }
            const oldElem = SwapPane.inputs.select2.find('[value='+SwapPane.inputs.select1.val()+']')
            this.select2OldElem = {
                elem: oldElem,
                index: oldElem.index()
            }
            this.select2OldElem.elem.remove()
            SwapPane.inputs.select2.selectpicker('refresh')
        }else{
            if(this.select1OldElem != ""){
                SwapPane.inputs.select1.append(this.select1OldElem.elem)
                this.select1OldElem.elem.insertIndex(this.select1OldElem.index)
            }
            const oldElem = SwapPane.inputs.select1.find('[value='+SwapPane.inputs.select2.val()+']')
            this.select1OldElem = {
                elem: oldElem,
                index: oldElem.index()
            }
            this.select1OldElem.elem.remove()
            SwapPane.inputs.select1.selectpicker('refresh')
        }

    }

}

const swapPane = new SwapPane()
