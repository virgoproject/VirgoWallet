class SecurityHandlers {

    static register(){
        addBgMessageHandler("getMnemonic", this.getMnemonic)
        addBgMessageHandler("setPassword", this.setPassword)
        addBgMessageHandler("passwordMatch", this.passwordMatch)
        addBgMessageHandler("restoreFromMnemonic", this.restoreFromMnemonic)
        addBgMessageHandler("isMnemonicValid", this.isMnemonicValid)
        addBgMessageHandler("getAutolock", this.getAutolock)
        addBgMessageHandler("setAutolock", this.setAutolock)
        addBgMessageHandler("getBiometrics", this.getBiometrics)
        addBgMessageHandler("setBiometrics", this.setBiometrics)
    }

    static getMnemonic(request, sender, sendResponse){
        sendResponse(baseWallet.mnemonic)
    }

    static setPassword(request, sender, sendResponse){
        baseWallet.encrypt(request.password)
        baseWallet.save()

        try {
            reactMessaging.storePassword(request.password)
        }catch(e){}

        browser.storage.local.set({"setupDone": true})
        setupDone = true

        sendResponse(true)
    }

    static passwordMatch(request, sender, sendResponse){
        sendResponse(baseWallet.passwordMatch(request.password))
    }

    static async restoreFromMnemonic(request, sender, sendResponse){
        try {
            baseWallet = BaseWallet.generateWallet(request.mnemonic)
            baseWallet.save()

            accName = {}
            browser.storage.local.set({"accountsNames": accName})

            browser.storage.local.set({"setupDone": true})
            setupDone = true

            while(baseWallet.getCurrentWallet().getAddressesJSON().length == 0){
                await new Promise(r => setTimeout(r, 10));
            }

            sendResponse(WalletHandlers._getBaseInfos())
        }catch(e){
            console.log(e)
            sendResponse(false)
        }
    }

    static isMnemonicValid(request, sender, sendResponse){
        try {
            BaseWallet.generateWallet(request.mnemonic)
            sendResponse(true)
        }catch(e){
            console.log(e)
            sendResponse(false)
        }
    }

    static getAutolock(request, sender, sendResponse){
        sendResponse({
            enabled: autolockEnabled,
            delay: lockDelay
        })
    }

    static setAutolock(request, sender, sendResponse){
        autolockEnabled = request.enabled
        lockDelay = request.delay
        browser.storage.local.set({"autolockEnabled": autolockEnabled})
        browser.storage.local.set({"lockDelay": lockDelay})
        return false
    }

    static getBiometrics(request, sender, sendResponse){
        sendResponse(biometricsEnabled)
    }

    static setBiometrics(request, sender, sendResponse){
        biometricsEnabled = request.enabled
        browser.storage.local.set({"biometricsEnabled": biometricsEnabled})
    }

}

SecurityHandlers.register()
