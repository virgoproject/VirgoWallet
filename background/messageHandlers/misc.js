class MiscHandlers {

    static register(){
        addBgMessageHandler("validateAddress", this.validateAddress)
        addBgMessageHandler("getGasPrice", this.getGasPrice)
        addBgMessageHandler("closedBackupPopup", this.closedBackupPopup)
        addBgMessageHandler("closedUpdatePopup", this.closedUpdatePopup)
        addBgMessageHandler("tickerFromChainID", this.tickerFromChainID)
        addBgMessageHandler("checkClosedModal", this.checkClosedModal)
        addBgMessageHandler("changeModalStatus", this.changeModalStatus)
        addBgMessageHandler("getNotifications", this.getNotifications)
        addBgMessageHandler("hideNotification", this.hideNotification)
        addBgMessageHandler("setSetupDone", this.setSetupDone)
        addBgMessageHandler("tutorialDone", this.tutorialDone)
        addBgMessageHandler("setupNot", this.setupNot)
        addBgMessageHandler("setTutorialDone", this.setTutorialDone)
    }

    static validateAddress(request, sender, sendResponse){
        sendResponse(web3.utils.isAddress(request.address))
    }

    static getGasPrice(request, sender, sendResponse){
        if(request.chainID == ""){
            web3.eth.getGasPrice().then(gasPrice => sendResponse(gasPrice))
            return
        }

        const w3 = baseWallet.getWeb3ByID(request.chainID)
        w3.eth.getGasPrice().then(gasPrice => sendResponse(gasPrice))
    }

    static closedBackupPopup(request, sender, sendResponse){
        backupPopupDate = Date.now() + 604800000
        browser.storage.local.set({"backupPopupDate": backupPopupDate});
        return false
    }

    static closedUpdatePopup(request, sender, sendResponse){
        baseWallet.version = VERSION
        baseWallet.save()
        return false
    }

    static tickerFromChainID(request, sender, sendResponse){
        sendResponse(baseWallet.getChainByID(request.id))
    }

    static checkClosedModal(request, sender, sendResponse){
        let status = request.infos[0]
        for (let i = 0; status.length > i; i++){
            browser.storage.local.get('airdrop' + status[i].airdropID ).then(function(res) {
                if (res['airdrop' + status[i].airdropID] === undefined){
                    sendResponse(true)
                    return
                }
            })
        }

        sendResponse(false)
    }

    static changeModalStatus(request, sender, sendResponse){
        for (let i =0; request.state[0].length > i; i++){
            const json = {}
            json['airdrop' + request.state[i].airdropID] = true
            browser.storage.local.set(json)
        }
    }

    static getNotifications(request, sender, sendResponse){
        browser.storage.local.get('notifications').then(function(res) {
            sendResponse(res.notifications)
            countNotifs()
        })
    }

    static hideNotification(request, sender, sendResponse){
        browser.storage.local.get('notifications').then(function(res) {
            for (var i=0 ; i < res.notifications.length ; i++)
            {

                if (res.notifications[i].id === Number(request.id)) {
                    res.notifications[i].shown = false;
                    browser.storage.local.set({"notifications": res.notifications})
                    countNotifs()
                    sendResponse(true)
                    break
                }
            }

        })
    }

    static setSetupDone(request, sender, sendResponse){
        browser.storage.local.set({"setupDone": true})
        setupDone = true
        sendResponse(setupDone)
    }

    static tutorialDone(request, sender, sendResponse){
        sendResponse(tutorialDone)
    }

    static setupNot(request, sender, sendResponse){
        browser.storage.local.set({"setupDone": false})
        setupDone = false
    }

    static setTutorialDone(request, sender, sendResponse){
        browser.storage.local.set({"tutorialDone": true})
        tutorialDone = true
    }

}

MiscHandlers.register()
