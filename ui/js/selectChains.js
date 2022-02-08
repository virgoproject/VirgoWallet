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
    for(const walletObj of data.wallets){
        const wallet = walletObj.wallet
        const elem = $("#baseChainRow").clone()

        elem.find("h3").html(wallet.name)
        elem.find("p").html(wallet.ticker)

        $("#chainSelector").append(elem)
        elem.show()
    }
}

