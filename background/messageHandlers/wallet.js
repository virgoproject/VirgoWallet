class WalletHandlers {

    static register(){
        addBgMessageHandler("getBaseInfos", this.getBaseInfos)
        addBgMessageHandler("getChainInfos", this.getChainInfos)
        addBgMessageHandler("unlockWallet", this.unlockWallet)
        addBgMessageHandler("changeWallet", this.changeWallet)
        addBgMessageHandler("addAccount", this.addAccount)
        addBgMessageHandler("changeAccount", this.changeAccount)
        addBgMessageHandler("changeAccountName", this.changeAccountName)
    }

    static async getBaseInfos(request, sender, sendResponse){
        checkAutolock()

        if(baseWallet === undefined)
            sendResponse({"locked": true, "biometricsEnabled": biometricsEnabled})
        else {
            while(baseWallet.getCurrentWallet().getAddressesJSON().length == 0){
                await new Promise(r => setTimeout(r, 10));
            }
            sendResponse(WalletHandlers._getBaseInfos())
            activityHeartbeat()
        }
    }

    static _getBaseInfos(){
        if (baseWallet.version != VERSION){
            browser.storage.local.set({"setupDone": true})
            setupDone = true
        }

        return {
            "wallets": baseWallet.getWalletsJSON(),
            "selectedWallet": baseWallet.selectedWallet,
            "addresses": baseWallet.getCurrentWallet().getAddressesJSON(),
            "selectedAddress": baseWallet.selectedAddress,
            "encrypted": baseWallet.isEncrypted(),
            "backupPopup": !baseWallet.isEncrypted() && backupPopupDate < Date.now(),
            "updatePopup":  baseWallet.version != VERSION,
            "connectedSites": connectedWebsites,
            "notifications" : notifications,
            "notificationsCount" : notifCounter,
            "selectedCurrency" : selectedCurrency,
            "setupDone" : setupDone,
            "biometricsEnabled": biometricsEnabled
        }
    }

    static getChainInfos(request, sender, sendResponse){
        const chain = baseWallet.getChainByID(request.chainID)
        sendResponse(chain.toJSON())
    }

    static unlockWallet(request, sender, sendResponse){
        activityHeartbeat()
        BaseWallet.loadFromJSON(request.password).then(async function(res){
            if(res){
                browser.storage.session.set({"unlockPassword": request.password})

                while(baseWallet.getCurrentWallet().getAddressesJSON().length == 0){
                    await new Promise(r => setTimeout(r, 10));
                }

                sendResponse(WalletHandlers._getBaseInfos())
            }
            else sendResponse(false)
        })
    }

    static changeWallet(request, sender, sendResponse){
        baseWallet.selectWallet(request.walletId)
        sendResponse(true)
        sendMessageToTabs("chainChanged", baseWallet.getCurrentWallet().chainID)
    }

    static async addAccount(request, sender, sendResponse){
        const oldAccountCount = baseWallet.addresses.length+0

        baseWallet.addAccount()

        while(oldAccountCount == baseWallet.addresses.length){
            await new Promise(r => setTimeout(r, 10));
        }

        sendResponse(WalletHandlers._getBaseInfos())
    }

    static changeAccount(request, sender, sendResponse){
        baseWallet.selectAddress(request.accountID)
        sendResponse(WalletHandlers._getBaseInfos())
        sendMessageToTabs("accountsChanged", [baseWallet.getCurrentAddress()])
    }

    static changeAccountName(request, sender, sendResponse){
        accName[request.address] = request.newName
        browser.storage.local.set({"accountsNames": accName});
        return false
    }



}

WalletHandlers.register()
