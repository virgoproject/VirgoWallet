let MAIN_ASSET;

$("#mainPane .resume .address").click(function(){
    copyToClipboard(document.querySelector("[data-mainAddress]"));
    $("#mainPane .resume .address .title").html("Copied!")

    setTimeout(function(){
        $("#mainPane .resume .address .title").html("Wallet Address")
    }, 2500)
})

$("#mainPane .resume .assets .addAsset").click(function(){
    $("#body .bodyElem.addAsset .assetContract .input").val("")
    $("#body .bodyElem.addAsset .assetContract .input").attr("disabled", false)
    enableLoadBtn($("#body .bodyElem.addAsset .assetContract .submit"))
    $("#body .bodyElem.addAsset .assetContract .submit").attr("disabled", true)
    $("#body .bodyElem.addAsset .assetContract").show()
    $("#body .bodyElem.addAsset .assetResume").hide()
    $("#body .bodyElem.resume").hide()
    $("#body .bodyElem.addAsset").show()
})

$("#body .bodyElem.addAsset .back").click(function(){
    $("#body .bodyElem.resume").show()
    $("#body .bodyElem.addAsset").hide()
})

$("#body .bodyElem.addAsset .assetContract .input").on("input", function(){
    validateAddress($(this).val()).then(function(res){
        $("#body .bodyElem.addAsset .assetContract .submit").attr("disabled", !res)
    })
})

$("#body .bodyElem.addAsset .assetContract .submit").click(function(){
    $("#body .bodyElem.addAsset .assetContract .input").attr("disabled", true)
    disableLoadBtn($(this))

    getTokenDetails($("#body .bodyElem.addAsset .assetContract .input").val()).then(function(details){
        if(!details){
            $("#body .bodyElem.addAsset .assetContract .input").attr("disabled", false)
            enableLoadBtn($("#body .bodyElem.addAsset .assetContract .submit"))
            $("#body .bodyElem.addAsset .assetContract .submit").attr("disabled", true)

            $("#body .bodyElem.addAsset .assetContract .input").addClass("is-invalid")
            $("#body .bodyElem.addAsset .assetContract .label").addClass("text-danger")
            $("#body .bodyElem.addAsset .assetContract .label").html("Invalid contract")

            setTimeout(function(){
                $("#body .bodyElem.addAsset .assetContract .input").removeClass("is-invalid")
                $("#body .bodyElem.addAsset .assetContract .label").removeClass("text-danger")
                $("#body .bodyElem.addAsset .assetContract .label").html("Contract address")
            }, 2500)
            return
        }

        $("#body .bodyElem.addAsset .assetResume .name").val(details.name)
        $("#body .bodyElem.addAsset .assetResume .decimals").val(details.decimals)
        $("#body .bodyElem.addAsset .assetResume .symbol").val(details.symbol)
        $("#body .bodyElem.addAsset .assetResume .ticker").html(details.symbol)

        enableLoadBtn($("#body .bodyElem.addAsset .assetContract .submit"))
        $("#body .bodyElem.addAsset .assetContract").hide()
        $("#body .bodyElem.addAsset .assetResume").show()
    })
})

$("#body .bodyElem.addAsset .assetResume .submit").click(function(){
    const contract = $("#body .bodyElem.addAsset .assetContract .input").val().toLowerCase()
    const name = $("#body .bodyElem.addAsset .assetResume .name").val()
    const decimals = $("#body .bodyElem.addAsset .assetResume .decimals").val()
    const symbol = $("#body .bodyElem.addAsset .assetResume .symbol").val()

    addAsset(name, symbol, decimals, contract).then(function(){
        $("#body .bodyElem.addAsset .back").click()
        notyf.success("Added "+symbol+"!")
    })

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