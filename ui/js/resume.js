MAIN_ASSET = undefined

class MainPane {

    static resume = $("#body .bodyElem.resume")
    static address = $("#mainPane .header .address")
    static addressTitle = $("#mainPane .header .address .title")
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
    static updatePopup = {
        self: $("#updatePopup"),
        close: $("#updatePopup .close")
    }
    static carouselImage = $("#carousel-image")
    static carousel = $("#carousel-wallet-inner")
    static carouselLoading = $(".loading")
    static baseAssetRow = $("#baseAssetRow")
    static walletAssets = $("#walletAssets")
    static fluctuation = $("#mainPane .header .stats .fluctuation")

    constructor() {

        this.oldData = ""

        MainPane.address.click(function(){
            copyToClipboard(document.querySelector("[data-mainAddress]"));
            MainPane.addressTitle.html("Copied! (")

            setTimeout(function(){
                MainPane.addressTitle.html("Wallet Address (")
            }, 2500)
        })

        MainPane.backupPopup.self.click(function(){
            closedBackupPopup()
        })

        MainPane.backupPopup.close.click(function(){
            closedBackupPopup()
        })

        MainPane.updatePopup.self.click(function(){
            closedUpdatePopup()
        })

        MainPane.updatePopup.close.click(function(){
            closedUpdatePopup()
        })

        MainPane.backupPopup.button.click(function(){
            SettingsPane.accountSelectionHeader.click()
            SettingsPane.openSettingsBtn.click()
            $("#settings .mainSettings [data-target=security]").click()
            $("#settings .settingsCat[data-settingid=security] [data-target=setupPassword]").click()
            MainPane.backupPopup.close.click()
        })

        const requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        fetch("https://raw.githubusercontent.com/virgoproject/walletBanners/main/data.json", requestOptions)
            .then(response => response.json())
            .then(result => {

                Object.keys(result).forEach(key => {
                    MainPane.carouselLoading.hide()
                    const img = MainPane.carouselImage.clone()
                    img.attr("id", "bal"+result[key].img)

                    img.find(".image").attr("src","https://raw.githubusercontent.com/virgoproject/walletBanners/main/"+result[key].img);
                    img.find(".image").click(function (){
                        window.open(result[key].href, "_blank")
                    })
                    img.removeClass("d-none")
                    MainPane.carousel.append(img)
                    if (key == 0){
                        img.addClass("active")
                        img.show()
                    }
                });

            })
            .catch(error => console.log('error', error));

    }

    updateData(){
        browser.runtime.sendMessage({command: 'getBaseInfos'})
            .then(function (response) {
                if(mainPane.oldData !== JSON.stringify(response)) {
                    mainPane.displayData(response)
                    transactionsPane.updateTxs(response)
                    mainPane.oldData = JSON.stringify(response)
                    swapPane.updateBalance(SwapPane.inputs.one, true)
                    swapPane.updateBalance(SwapPane.inputs.two, true)
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

                elem.click(function(){
                    tokenDetailPane.displayToken(balance)
                })

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
                elem.unbind("click").click(function(){
                    tokenDetailPane.displayToken(balance)
                })
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

        if(data.updatePopup)
            MainPane.updatePopup.self.show()

        setInterval(function(){
            mainPane.updateData()
        }, 250)
    }

}

const mainPane = new MainPane()
