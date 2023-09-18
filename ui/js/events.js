class Events {

    constructor() {

        this.oldData = ""
        this.firstRun = true
        this.oldDataJSON

        this.chainChangedListeners = []
        this.addressChangedListeners = []
        this.assetsChangedListeners = []
        this.addressesChangedListeners = []
        this.currencyChangedListeners = []
        this.notifsCountListeners = []
        this.transactionsChangedListeners = []
    }

    fireChainChangedEvent(data){
        for(const listener of this.chainChangedListeners)
            listener(data)
    }

    fireAddressChangedEvent(data){
        for(const listener of this.addressChangedListeners)
            listener(data)
    }

    fireAddressesChangedEvent(data){
        for(const listener of this.addressesChangedListeners)
            listener(data)
    }

    fireNotifsEvent(data){
        for(const listener of this.notifsCountListeners)
            listener(data)
    }

    fireAssetsChanged(data){
        for(const listener of this.assetsChangedListeners)
            listener(data)
    }

    fireCurrencyChanged(data){
        for(const listener of this.currencyChangedListeners)
            listener(data)
    }

    fireTransactionsChanged(data){
        for(const listener of this.transactionsChangedListeners)
            listener(data)
    }

    //Check for changes in wallet data and fire events accordingly
    updateData(data){
        const dataString = JSON.stringify(data)
        if(this.oldData !== dataString) {



            if(this.firstRun){
                this.fireChainChangedEvent(data)
                this.fireAddressChangedEvent(data)
                this.fireAddressesChangedEvent(data)
                this.fireAssetsChanged(data)
                this.fireCurrencyChanged(data)
                this.fireNotifsEvent(data)
                this.fireTransactionsChanged(data)
            }else{

                this.oldDataJSON = JSON.parse(this.oldData)

                if(this.oldDataJSON.selectedWallet != data.selectedWallet){
                    this.fireChainChangedEvent(data)
                    this.fireCurrencyChanged(data)
                }

                if(this.oldDataJSON.selectedAddress != data.selectedAddress)
                    this.fireAddressChangedEvent(data)

                if(JSON.stringify(this.oldDataJSON.wallets[this.oldDataJSON.selectedWallet].wallet.tokens) != JSON.stringify(data.wallets[data.selectedWallet].wallet.tokens)) {
                    console.log("assets changed")
                    this.fireAssetsChanged(data)
                }

                if(JSON.stringify(this.oldDataJSON.addresses) != JSON.stringify(data.addresses))
                    this.fireAddressesChangedEvent(data)

                if(this.oldDataJSON.selectedCurrency != data.selectedCurrency)
                    this.fireCurrencyChanged(data)

                if(this.oldDataJSON.notificationsCount !== data.notificationsCount){
                    this.fireNotifsEvent(data)
                }

                if(JSON.stringify(this.oldDataJSON.wallets[this.oldDataJSON.selectedWallet].wallet.transactions) != JSON.stringify(data.wallets[data.selectedWallet].wallet.transactions)){
                    console.log("transactions changed")
                    this.fireTransactionsChanged(data)
                }

            }

            this.oldData = dataString
            this.firstRun = false
        }
    }

    addListener(eventType, listener){
        switch (eventType){
            case "chainChanged":
                this.chainChangedListeners.push(listener)
                break
            case "addressChanged":
                this.addressChangedListeners.push(listener)
                break
            case "addressesChanged":
                this.addressesChangedListeners.push(listener)
                break
            case "assetsChanged":
                this.assetsChangedListeners.push(listener)
                break
            case "currencyChanged":
                this.currencyChangedListeners.push(listener)
                break
            case "notifsCountChanged":
                this.notifsCountListeners.push(listener)
                break
            case "transactionsChanged":
                this.transactionsChangedListeners.push(listener)
                break
        }
    }

}

events = new Events()
