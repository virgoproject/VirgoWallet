$("#chainSelectionHeader").click(function(){
    if($("#chainSelector").hasClass("opened")){
        $("#chainSelector").removeClass("opened")
        $("#chainSelectionHeader").removeClass("opened")
    } else{
        $("#chainSelector").addClass("opened")
        $("#chainSelectionHeader").addClass("opened")
    }
})

function setChains(data){
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

                    $("[data-networkname]").html(wallet.name)
                    $("[data-networkticker]").html(wallet.ticker)

                    MAIN_ASSET = wallet

                    $("#chainSelectionHeader").click()
                })

        })

        $("#chainSelector").append(elem)
        elem.show()

        i++
    }
}

