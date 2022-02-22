let MAIN_ASSET;

$("#mainPane .resume .address").click(function(){
    copyToClipboard(document.querySelector("[data-mainAddress]"));
    $("#mainPane .resume .address .title").html("Copied!")

    setTimeout(function(){
        $("#mainPane .resume .address .title").html("Wallet Address")
    }, 2500)
})

function updateData(){

    browser.runtime.sendMessage({command: 'getBaseInfos'})
        .then(function (response) {
            displayData(response)
        })

}

function displayData(data){
    const selectedAddress = data.addresses[data.selectedAddress]
    $("[data-mainAddress]").html(selectedAddress.address)

    const selectedWallet = data.wallets[data.selectedWallet].wallet

    $("[data-networkname]").html(selectedWallet.name)
    $("[data-networkticker]").html(selectedWallet.ticker)

    MAIN_ASSET = selectedWallet

    let totalBalance = 0;

    //display tokens balances
    Object.entries(selectedAddress.balances).map(([contractAddr, balance]) => {
        let elem = $("#bal"+contractAddr);
        if(!elem.length){
            //create row for this asset
            elem = $("#baseAssetRow").clone()
            elem.attr("id", "bal"+contractAddr)

            elem.find(".title").html(balance.name)
            elem.find(".ticker").html(balance.ticker)
            elem.find(".balance").html(Utils.formatAmount(balance.balance, balance.decimals))
            elem.find(".logo").css("background-image", "url('https://raw.githubusercontent.com/virgoproject/tokens/main/" + data.wallets[data.selectedWallet].wallet.ticker + "/" + contractAddr + "/logo.png')");
            elem.find(".fiatEq").html("$" + Utils.beautifyAmount(balance.price*balance.balance/10**balance.decimals))
            $("#walletAssets").append(elem)
            elem.show()
        }

        //update displayed balance
        elem.find(".balance").html(Utils.formatAmount(balance.balance, balance.decimals))
        elem.find(".fiatEq").html("$" + Utils.beautifyAmount(balance.price*balance.balance/10**balance.decimals))

        totalBalance += balance.price*balance.balance/10**balance.decimals;

        //permits to display dynamic price anywhere without fetching again background
        $('[data-bal="'+balance.contract+'"]').html(Utils.formatAmount(balance.balance, balance.decimals))
    })

    $("[data-fiatTotal]").html("$" + Utils.beautifyAmount(totalBalance))

    for(const addressObj of data.addresses) {
        const address = addressObj.address
        $('[data-accountMainBalance="'+address+'"]').html(Utils.formatAmount(addressObj.balances[selectedWallet.ticker].balance, selectedWallet.decimals))
    }
}

function setResume(data){
    displayData(data)

    setInterval(function(){
        updateData()
    }, 100)
}