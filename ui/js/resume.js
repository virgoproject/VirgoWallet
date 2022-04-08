MAIN_ASSET = undefined

class MainPane {

    constructor() {

        this.oldData = ""

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

        $("#backupPopup").click(function(){
            closedBackupPopup()
        })

        $("#backupPopup .close").click(function(){
            closedBackupPopup()
        })

        $("#backupPopup .button").click(function(){
            $("#accountSelectionHeader").click()
            $("#settings .mainPane .openSettings").click()
            $("#settings .mainSettings [data-target=security]").click()
            $("#settings .settingsCat[data-settingid=security] [data-target=setupPassword]").click()
            $("#backupPopup .close").click()
        })

    }

    updateData(){
        browser.runtime.sendMessage({command: 'getBaseInfos'})
            .then(function (response) {
                if(mainPane.oldData !== JSON.stringify(response)) {
                    mainPane.displayData(response)
                    mainPane.oldData = JSON.stringify(response)
                }
            })
    }

    displayData(data){
        const selectedAddress = data.addresses[data.selectedAddress]
        $("[data-mainAddress]").html(selectedAddress.address)

        const selectedWallet = data.wallets[data.selectedWallet].wallet

        $("[data-networkname]").html(selectedWallet.name)
        $("[data-networkticker]").html(selectedWallet.ticker)

        MAIN_ASSET = selectedWallet

        let totalBalance = 0;

        let hasChanged = false

        //display tokens balances
        Object.entries(selectedAddress.balances).map(([contractAddr, balance]) => {
            let elem = $("#bal"+contractAddr);

            const bal = Utils.formatAmount(balance.balance, balance.decimals)
            const fiatBal = "$" + Utils.beautifyAmount(balance.price*balance.balance/10**balance.decimals)

            if(!elem.length){
                //create row for this asset
                elem = $("#baseAssetRow").clone()
                elem.attr("id", "bal"+contractAddr)

                elem.find(".title").html(balance.name)
                elem.find(".ticker").html(balance.ticker)
                elem.find(".balance").html(Utils.formatAmount(balance.balance, balance.decimals))
                elem.find(".logo").css("background-image", "url('https://raw.githubusercontent.com/virgoproject/tokens/main/" + data.wallets[data.selectedWallet].wallet.ticker + "/" + contractAddr + "/logo.png')");
                elem.find(".fiatEq").html("$" + Utils.beautifyAmount(balance.price*balance.balance/10**balance.decimals))

                elem.find(".fluctuation val").html(Math.abs(balance.change).toFixed(2))
                if(balance.change >= 0)
                    elem.find(".fluctuation").removeClass("negative")
                else
                    elem.find(".fluctuation").addClass("negative")


                $("#walletAssets").append(elem)
                hasChanged = true
                if(contractAddr == MAIN_ASSET.ticker)
                    elem.attr("data-sort", 9999999999999999)
                else
                    elem.attr("data-sort", balance.price == 0 ? balance.balance/10**balance.decimals*2 : balance.price*balance.balance/10**balance.decimals)
                elem.show()
            }else{
                if(elem.find(".balance").html() != bal || elem.find(".fiatEq").html() != fiatBal){
                    //serve for sorting
                    if(contractAddr == MAIN_ASSET.ticker)
                        elem.attr("data-sort", 9999999999999999)
                    else
                        elem.attr("data-sort", balance.price == 0 ? balance.balance/10**balance.decimals*2 : balance.price*balance.balance/10**balance.decimals)

                    hasChanged = true
                }
                elem.find(".balance").html(bal)
                elem.find(".fiatEq").html(fiatBal)
            }

            totalBalance += balance.price*balance.balance/10**balance.decimals;

            //permits to display dynamic price anywhere without fetching again background
            $('[data-bal="'+balance.contract+'"]').html(Utils.formatAmount(balance.balance, balance.decimals))
        })

        if(!hasChanged) return

        $("[data-fiatTotal]").html("$" + Utils.beautifyAmount(totalBalance))

        let totalChange = 0;

        if(totalBalance != 0)
            Object.entries(selectedAddress.balances).map(([contractAddr, balance]) => {
                totalChange += balance.change*balance.price*balance.balance/10**balance.decimals/totalBalance
            })

        let headerFluct = $("#mainPane .header .stats .fluctuation")

        headerFluct.find("val").html(Math.abs(totalChange).toFixed(2))
        if(totalChange >= 0)
            headerFluct.removeClass("negative")
        else
            headerFluct.addClass("negative")

        for(const addressObj of data.addresses) {
            const address = addressObj.address
            $('[data-accountMainBalance="'+address+'"]').html(Utils.formatAmount(addressObj.balances[selectedWallet.ticker].balance, selectedWallet.decimals))
        }

        tinysort("#walletAssets > div",{attr:"data-sort", order:'desc'});
    }

    setResume(data){
        this.displayData(data)

        if(data.backupPopup)
            $("#backupPopup").show()

        setInterval(function(){
            mainPane.updateData()
        }, 250)
    }

}

const mainPane = new MainPane()
