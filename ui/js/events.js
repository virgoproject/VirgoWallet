class Events {

    constructor() {

        this.oldData = ""
        this.oldDataJSON

        this.chainChangedListeners = []
        this.addressChangedListeners = []
        this.assetsChangedListeners = []

    }

    fireChainChangedEvent(data){
        for(const listener of this.chainChangedListeners)
            listener(data)
    }

    fireAddressChangedEvent(data){
        for(const listener of this.addressChangedListeners)
            listener(data)
    }

    fireAssetsChanged(data){
        for(const listener of this.assetsChangedListeners)
            listener(data)
    }

    //Check for changes in wallet data and fire events accordingly
    updateData(data){
        const dataString = JSON.stringify(data)
        if(events.oldData !== dataString) {

            if(events.oldDataJSON == undefined){
                events.fireChainChangedEvent(data)
                events.fireAddressChangedEvent(data)
                events.fireAssetsChanged(data)
            }else{

                if(events.oldDataJSON.selectedWallet != data.selectedWallet)
                    this.fireChainChangedEvent(data)

                if(events.oldDataJSON.selectedAddress != data.selectedAddress)
                    this.fireAddressChangedEvent(data)

                if(JSON.stringify(events.oldDataJSON.wallets[events.oldDataJSON.selectedWallet].wallet.tokens) != JSON.stringify(data.wallets[data.selectedWallet].wallet.tokens))
                    this.fireAssetsChanged(data)

            }

            events.oldData = dataString
            events.oldDataJSON = data
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
            case "assetsChanged":
                this.assetsChangedListeners.push(listener)
                break
        }
    }

}

events = new Events()
