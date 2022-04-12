class SelectChains {
    
    static header = $("#chainSelectionHeader")
    static selector = $("#chainSelector")
    
    constructor() {
        SelectChains.header.click(function(){
            if(SelectChains.selector.hasClass("opened")){
                SelectChains.selector.removeClass("opened")
                SelectChains.header.removeClass("opened")
            } else{
                SelectChains.selector.addClass("opened")
                SelectChains.header.addClass("opened")
            }
        })
    }

    setChains(data){
        $("#mainPaneCurrentChain").html(data.wallets[data.selectedWallet].wallet.name)

        let i = 0;
        for(const walletObj of data.wallets){
            const wallet = walletObj.wallet
            const elem = $("#baseChainRow").clone()

            elem.attr("data-walletid", i)

            if(walletObj === data.wallets[data.selectedWallet])
                elem.addClass("selected")

            elem.find("h3").html(wallet.name)
            elem.find("p").html(wallet.ticker)

            elem.click(function(){
                if(elem.hasClass("selected")) return

                browser.runtime.sendMessage({command: 'changeWallet', walletId: elem.attr("data-walletid")})
                    .then(function () {
                        $("#chainSelector .chain.selected").removeClass("selected")
                        elem.addClass("selected")

                        //reset assets
                        const baseAssetRow = $("#baseAssetRow").clone()
                        $("#walletAssets").html("")
                        $("#walletAssets").append(baseAssetRow)

                        //reset send form
                        getBaseInfos().then(function(res){
                            SendPane.recipient.val("")
                            SendPane.amount.val("")
                            SendPane.backBtn.attr("disabled", false)
                            enableLoadBtn(SendPane.btnSubmit)
                            SendPane.backBtn.click()
                            SendPane.assetSelect.html("")
                            sendPane.setSend(res)
                        })

                        $("[data-networkname]").html(wallet.name)
                        $("[data-networkticker]").html(wallet.ticker)

                        MAIN_ASSET = wallet

                        SelectChains.header.click()
                    })

            })

            SelectChains.selector.append(elem)
            elem.show()

            i++
        }
    }
    
}

const selectChains = new SelectChains()