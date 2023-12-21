class GeneralHandlers {

    static register(){
        addBgMessageHandler("setSelectedCurrency", this.setSelectedCurrency)
    }

    static setSelectedCurrency(request, sender, sendResponse){
        selectedCurrency = request.currency
        browser.storage.local.set({"selectedCurrency": request.currency})
    }

}

GeneralHandlers.register()
