MAIN_ASSET = undefined

class MainPane {

    static resume = $("#body .bodyElem.resume")
    static address = $("#mainPane .resume .address")
    static addressTitle = $("#mainPane .resume .address .title")
    static addAsset = {
        pane: $("#body .bodyElem.addAsset"),
        contract: $("#body .bodyElem.addAsset .assetContract"),
        contractInput: $("#body .bodyElem.addAsset .assetContract .input"),
        contractSubmit: $("#body .bodyElem.addAsset .assetContract .submit"),
        contractLabel: $("#body .bodyElem.addAsset .assetContract .label"),
        resume: {
            self: $("#body .bodyElem.addAsset .assetResume"),
            name: $("#body .bodyElem.addAsset .assetResume .name"),
            decimals: $("#body .bodyElem.addAsset .assetResume .decimals"),
            symbol: $("#body .bodyElem.addAsset .assetResume .symbol"),
            ticker: $("#body .bodyElem.addAsset .assetResume .ticker"),
            submit: $("#body .bodyElem.addAsset .assetResume .submit")
        },
        back: $("#body .bodyElem.addAsset .back")
    }
    static backupPopup = {
        self: $("#backupPopup"),
        close: $("#backupPopup .close"),
        button: $("#backupPopup .button")
    }
    static baseAssetRow = $("#baseAssetRow")
    static walletAssets = $("#walletAssets")
    static fluctuation = $("#mainPane .header .stats .fluctuation")

    constructor() {

        this.oldData = ""

        MainPane.address.click(function(){
            copyToClipboard(document.querySelector("[data-mainAddress]"));
            MainPane.addressTitle.html("Copied!")

            setTimeout(function(){
                MainPane.addressTitle.html("Wallet Address")
            }, 2500)
        })

        /**MainPane.addAssetBtn.click(function(){
            MainPane.addAsset.contractInput.val("")
            MainPane.addAsset.contractInput.attr("disabled", false)
            enableLoadBtn(MainPane.addAsset.contractSubmit)
            MainPane.addAsset.contractSubmit.attr("disabled", true)
            MainPane.addAsset.contract.show()
            MainPane.addAsset.resume.self.hide()
            MainPane.resume.hide()
            MainPane.addAsset.pane.show()
        })**/

        MainPane.addAsset.back.click(function(){
            MainPane.resume.show()
            MainPane.addAsset.pane.hide()
        })

        MainPane.addAsset.contractInput.on("input", function(){
            validateAddress($(this).val()).then(function(res){
                MainPane.addAsset.contractSubmit.attr("disabled", !res)
            })
        })

        MainPane.addAsset.contractSubmit.click(function(){
            MainPane.addAsset.contractInput.attr("disabled", true)
            disableLoadBtn($(this))

            getTokenDetails(MainPane.addAsset.contractInput.val()).then(function(details){
                if(!details){
                    MainPane.addAsset.contractInput.attr("disabled", false)
                    enableLoadBtn(MainPane.addAsset.contractSubmit)
                    MainPane.addAsset.contractSubmit.attr("disabled", true)

                    MainPane.addAsset.contractInput.addClass("is-invalid")
                    MainPane.addAsset.contractLabel.addClass("text-danger")
                    MainPane.addAsset.contractLabel.html("Invalid contract")

                    setTimeout(function(){
                        MainPane.addAsset.contractInput.removeClass("is-invalid")
                        MainPane.addAsset.contractLabel.removeClass("text-danger")
                        MainPane.addAsset.contractLabel.html("Contract address")
                    }, 2500)
                    return
                }

                MainPane.addAsset.resume.name.val(details.name)
                MainPane.addAsset.resume.decimals.val(details.decimals)
                MainPane.addAsset.resume.symbol.val(details.symbol)
                MainPane.addAsset.resume.ticker.html(details.symbol)

                enableLoadBtn(MainPane.addAsset.contractSubmit)
                MainPane.addAsset.contract.hide()
                MainPane.addAsset.resume.self.show()
            })
        })

        MainPane.addAsset.resume.submit.click(function(){
            const contract = MainPane.addAsset.contractInput.val().toLowerCase()
            const name = MainPane.addAsset.resume.name.val()
            const decimals = MainPane.addAsset.resume.decimals.val()
            const symbol = MainPane.addAsset.resume.symbol.val()

            addAsset(name, symbol, decimals, contract).then(function(){
                MainPane.addAsset.back.click()
                notyf.success("Added "+symbol+"!")
            })

        })

        MainPane.backupPopup.self.click(function(){
            closedBackupPopup()
        })

        MainPane.backupPopup.close.click(function(){
            closedBackupPopup()
        })

        MainPane.backupPopup.button.click(function(){
            SettingsPane.accountSelectionHeader.click()
            SettingsPane.openSettingsBtn.click()
            $("#settings .mainSettings [data-target=security]").click()
            $("#settings .settingsCat[data-settingid=security] [data-target=setupPassword]").click()
            MainPane.backupPopup.close.click()
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
            console.log(contractAddr + " " + balance.tracked)
            if(!balance.tracked) return;

            let elem = $("#bal"+contractAddr);

            const bal = Utils.formatAmount(balance.balance, balance.decimals)
            const fiatBal = "$" + Utils.beautifyAmount(balance.price*balance.balance/10**balance.decimals)

            if(!elem.length){
                //create row for this asset
                elem = MainPane.baseAssetRow.clone()
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


                MainPane.walletAssets.append(elem)
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

        MainPane.fluctuation.find("val").html(Math.abs(totalChange).toFixed(2))

        if(totalChange >= 0)
            MainPane.fluctuation.removeClass("negative")
        else
            MainPane.fluctuation.addClass("negative")

        for(const addressObj of data.addresses) {
            const address = addressObj.address
            $('[data-accountMainBalance="'+address+'"]').html(Utils.formatAmount(addressObj.balances[selectedWallet.ticker].balance, selectedWallet.decimals))
        }

        tinysort("#walletAssets > div",{attr:"data-sort", order:'desc'});
    }

    setResume(data){
        this.displayData(data)

        if(data.backupPopup)
            MainPane.backupPopup.self.show()

        setInterval(function(){
            mainPane.updateData()
        }, 250)
    }

}

const mainPane = new MainPane()
