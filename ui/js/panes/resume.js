MAIN_ASSET = undefined

class MainPane {

    static self = $("#mainPane")
    static resume = $("#body .bodyElem.resume")
    static address = $("#walletAddress")
    static addressDiv = $(".contentAddress")
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
    static testnetFaucet = {
        self: $("#testnetFaucet"),
        button: $("#testnetFaucet span"),
        loader: $("#testnetFaucet i")
    }

    constructor() {

        events.addListener('notifsCountChanged', data => {
                if(data.notificationsCount === 0){
                    document.querySelector('.notifs').classList.add('d-none')
                }else {
                    document.querySelector('.notifsCount').innerText = data.notificationsCount
                }
        })

        MainPane.addressDiv.click(function(e){
            e.stopPropagation()
            let address = document.getElementById('walletAddress').textContent
            console.log(MainPane.address.address)
            copyToClipboard(MainPane.address.address);

            MainPane.address.html("Copied!")

            setTimeout(function(){
                MainPane.address.html(address)
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
            $("#settings .settingsCat[data-settingid=security] .tab[data-target=setupPassword]").click()
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

        events.addListener("chainChanged", data => {
            const selectedChain = data.wallets[data.selectedWallet].wallet

            if(selectedChain.chainID == 400)
                MainPane.testnetFaucet.self.show()
            else
                MainPane.testnetFaucet.self.hide()

        })

        events.addListener("currencyChanged", data => {
            console.log("currency changed")
            if (data.selectedCurrency === "eur"){
                $(".dollars").html("&euro;")
            }
            else if (data.selectedCurrency === "usd"){
                $(".dollars").html("$")
            }
        })

        MainPane.testnetFaucet.button.click(() => {
            MainPane.testnetFaucet.button.hide()
            MainPane.testnetFaucet.loader.show()
            getBaseInfos().then(infos => {
                const selectedAddress = infos.addresses[infos.selectedAddress].address
                fetch("https://faucet.virgo.net/api/claim/"+selectedAddress).then(resp => {
                    resp.json().then(json => {
                        if(json.status){
                            notyf.success("Claimed 1 HPN!")
                        }else{
                            switch (json.errorCode){
                                case 1:
                                    notyf.error("Please wait " + Math.round(json.waitFor/60000) + " minutes before claiming again")
                                    break
                                case 2:
                                    notyf.error("Faucet empty, please try again later")
                                    break
                                case 3:
                                    notyf.error("Bad request")
                                    break
                            }
                        }
                        MainPane.testnetFaucet.button.show()
                        MainPane.testnetFaucet.loader.hide()
                    })
                })
            })

        })
    }

    updateData(){
        browser.runtime.sendMessage({command: 'getBaseInfos'})
            .then(function (response) {
                if(events.oldData !== JSON.stringify(response)) {
                    console.log("updating")
                    mainPane.displayData(response)
                    transactionsPane.updateTxs(response)
                    swapPane.updateBalance(SwapPane.inputs.one, true)
                    swapPane.updateBalance(SwapPane.inputs.two, true)
                }
                events.updateData(response)
            })
    }

    displayData(data){
        const _this = this

        const selectedAddress = data.addresses[data.selectedAddress]
        $("[data-mainAddress]").html(selectedAddress.address)

        MainPane.address.html(selectedAddress.address.replace(selectedAddress.address.substring(4,38),"..."))
        MainPane.address.address = selectedAddress.address

        const selectedWallet = data.wallets[data.selectedWallet].wallet

        if(selectedWallet.testnet)
            $("[data-networkname]").html(selectedWallet.name + " Testnet")
        else
            $("[data-networkname]").html(selectedWallet.name)

        $("[data-networkticker]").html(selectedWallet.ticker)

        MAIN_ASSET = selectedWallet

        let totalBalance = 0;

        let hasChanged = false

        //display tokens balances

        const tokensFiatAmounts = []

        for(const contractAddr of Object.keys(selectedAddress.balances)){
            const balance = selectedAddress.balances[contractAddr]

            if(!balance.tracked) continue;

            let elem = $("#bal"+contractAddr);

            const bal = Utils.formatAmount(balance.balance, balance.decimals)
            const fiat = Utils.beautifyAmount(balance.price*balance.balance/10**balance.decimals)

            const fiatBal = fiat

            if(!elem.length){
                //create row for this asset
                elem = MainPane.baseAssetRow.clone()
                elem.attr("id", "bal"+contractAddr)

                elem.find(".title").html(balance.name)
                elem.find(".ticker").html(balance.ticker)
                elem.find(".balance").html(Utils.formatAmount(balance.balance, balance.decimals))

                elem.find(".logo").attr("id", 'logo'+contractAddr)
                elem.find(".logo").on('load', function() {
                    elem.find("svg").hide()
                    elem.find(".logo").show()
                    _this.updateTokenBar(selectedAddress)
                }).attr("src", "https://raw.githubusercontent.com/virgoproject/tokens/main/" + data.wallets[data.selectedWallet].wallet.ticker + "/" + contractAddr + "/logo.png");

                elem.find(".fiatEq").html(Utils.beautifyAmount(balance.price*balance.balance/10**balance.decimals))
                elem.find("svg").attr("data-jdenticon-value", contractAddr)

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

                    const bar = document.getElementById("bar"+contractAddr)

                    if(bar != null){
                        bar.style.width = parseInt(parseFloat(fiat)*10000)  + "%"
                    }else if(fiat != "0"){
                        const elem = document.getElementById("resumeTokenBarSample").cloneNode(true)
                        elem.style.backgroundColor = getDominantColor(document.getElementById("logo"+contractAddr))
                        elem.style.width = parseInt(parseFloat(fiat)*10000) + "%"
                        elem.style.display = "block"
                        elem.id = "bar"+contractAddr
                        elem.setAttribute("data-sort", parseInt(fiat))
                        document.getElementById("resumeTokenBar").append(elem)
                    }

                    if(document.getElementById("resumeTokenBar").children.length > 0)
                        tinysort("#resumeTokenBar > hr",{attr:"data-sort", order:'desc'});

                    hasChanged = true
                }
                elem.find(".balance").html(bal)
                elem.find(".fiatEq").html(fiatBal)
                elem.find(".fluctuation val").html(Math.abs(balance.change).toFixed(2))
                if(balance.change >= 0)
                    elem.find(".fluctuation").removeClass("negative")
                else
                    elem.find(".fluctuation").addClass("negative")
                elem.unbind("click").click(function(){
                    tokenDetailPane.displayToken(balance)
                })
            }

            totalBalance += balance.price*balance.balance/10**balance.decimals;

            //permits to display dynamic price anywhere without fetching again background
            $('[data-bal="'+balance.contract+'"]').html(Utils.formatAmount(balance.balance, balance.decimals))

        }

        _this.updateTokenBar(selectedAddress)

        if(!hasChanged) return

        let fixedValue = Utils.beautifyAmount(totalBalance)
        $(".values").html(fixedValue.toString().split(".")[0])

        if (Utils.beautifyAmount(totalBalance).toString().split('.')[1] === undefined){
            $('.decmialValues').html("." + 0)
        } else {
            $('.decmialValues').html("." + Utils.beautifyAmount(totalBalance).toString().split('.')[1])
        }

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

    updateTokenBar(selectedAddress){
        let totalBalance = 0;

        for(const contractAddr of Object.keys(selectedAddress.balances)){
            const balance = selectedAddress.balances[contractAddr]

            if(!balance.tracked) continue;

            totalBalance += balance.price*balance.balance/10**balance.decimals
        }

        for(const contractAddr of Object.keys(selectedAddress.balances)){
            const balance = selectedAddress.balances[contractAddr]

            if(!balance.tracked) continue;

            const fiat = balance.price*balance.balance/10**balance.decimals

            const bar = document.getElementById("bar"+contractAddr)

            if(bar != null){
                bar.style.width = parseInt(fiat / totalBalance * 100)  + "%"
                bar.style.backgroundColor = getDominantColor(document.getElementById("logo"+contractAddr))
            }else if(fiat != "0"){
                const elem = document.getElementById("resumeTokenBarSample").cloneNode(true)
                elem.style.backgroundColor = getDominantColor(document.getElementById("logo"+contractAddr))
                elem.style.width = parseInt(fiat / totalBalance * 100)  + "%"
                elem.style.display = "block"
                elem.id = "bar"+contractAddr
                elem.setAttribute("data-sort", parseInt(fiat))
                document.getElementById("resumeTokenBar").append(elem)
            }
        }

        try {
            tinysort("#resumeTokenBar > hr",{attr:"data-sort", order:'desc'});
        }catch(e){}

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
