class SelectChains {

    static header = $("#chainSelectionHeader")
    static selector = $("#chainSelector")
    static container = $("#chainsContainer")
    static baseChainRow = $("#baseChainRow")

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
            const elem = SelectChains.baseChainRow.clone()

            elem.attr("id", "")

            elem.attr("data-walletid", i)

            if(walletObj === data.wallets[data.selectedWallet])
                elem.find(".chain").addClass("selected")

            elem.find("name").html(wallet.name)
            elem.find("ticker").html(wallet.ticker)
            elem.find(".logo").css("background-image", "url('https://raw.githubusercontent.com/virgoproject/tokens/main/" + wallet.ticker + "/" + wallet.ticker + "/logo.png')");

            if(wallet.testnet)
                elem.find(".testnet").css("display", "inline-block")

            elem.click(function(){
                if(elem.find(".chain").hasClass("selected")) return

                browser.runtime.sendMessage({command: 'changeWallet', walletId: elem.attr("data-walletid")})
                    .then(function () {
                        $("#chainsContainer .chain.selected").removeClass("selected")
                        elem.find(".chain").addClass("selected")

                        //reset assets
                        const baseAssetRow = MainPane.baseAssetRow.clone()
                        MainPane.walletAssets.html("")
                        MainPane.walletAssets.append(baseAssetRow)

                        //reset send and swap form
                        getBaseInfos().then(function(res){
                            SendPane.recipient.val("")
                            SendPane.amount.val("")
                            SendPane.backBtn.attr("disabled", false)
                            enableLoadBtn(SendPane.btnSubmit)
                            SendPane.backBtn.click()
                            SendPane.assetSelect.html("")
                            sendPane.setSend(res)
                            swapPane.setSwap(res)
                        })

                        $("[data-networkname]").html(wallet.name)
                        $("[data-networkticker]").html(wallet.ticker)

                        MAIN_ASSET = wallet

                        SelectChains.header.click()
                    })

            })

            SelectChains.container.append(elem)
            elem.show()

            i++
        }
    }

}

const selectChains = new SelectChains()
