class GeneralHandlers {

    static register(){
        addBgMessageHandler("setSelectedCurrency", this.setSelectedCurrency)
        addBgMessageHandler("setLanguage", this.setLanguage)
    }

    static setSelectedCurrency(request, sender, sendResponse){
        selectedCurrency = request.currency
        browser.storage.local.set({"selectedCurrency": request.currency})
    }

    static setLanguage(request, sender, sendResponse){
        selectedLanguage = request.lang
        browser.storage.local.set({"selectedLanguage": request.lang})
    }

}

GeneralHandlers.register()
