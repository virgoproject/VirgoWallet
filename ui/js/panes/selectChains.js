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
        SelectChains.container.html("")
        let i = 0;
        for(const walletObj of data.wallets){
            const wallet = walletObj.wallet

            if(!wallet.tracked) continue

            const elem = SelectChains.baseChainRow.clone()

            elem.attr("id", "")

            elem.attr("data-walletid", i)

            if(walletObj === data.wallets[data.selectedWallet])
                elem.find(".chain").addClass("selected")

            elem.find("name").html(wallet.name)
            elem.find("ticker").html(wallet.ticker)
            elem.find(".logo").css("background-image", "url('https://raw.githubusercontent.com/virgoproject/tokens/main/" + wallet.chainID + "/logo.png')");

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

                        document.getElementById("resumeTokenBar").innerHTML = ""

                        $("[data-networkname]").html(wallet.name + " Testnet")
                        $("[data-networkticker]").html(wallet.ticker)

                        SelectChains.header.click()
                    })

            })

            SelectChains.container.append(elem)
            elem.show()

            i++
        }
    }

    updateChains(){
        const _this = this
        getBaseInfos().then(infos => {
            _this.setChains(infos)
        })
    }

}

const selectChains = new SelectChains()
