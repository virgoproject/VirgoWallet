class Web3Handlers {

    static register(){
        addBgMessageHandler("web3Request", this.web3Request)
        addBgMessageHandler("resolveWeb3Authorization", this.resolveWeb3Authorization)
        addBgMessageHandler("isWeb3Ready", this.isWeb3Ready)
    }

    static web3Request(request, sender, sendResponse){
        handleWeb3Request(request.origin, request.method, request.params, request.reqId, sender)
    }

    static resolveWeb3Authorization(request, sender, sendResponse){
        resolveWeb3Authorization(request)
        sendResponse(true)
    }

    static isWeb3Ready(request, sender, sendResponse){
        console.log("web3 ready req")
        const origin = Web3Handlers._resolveRequestOrigin(request, sender)

        if(!origin){
            sendResponse(false)
            return
        }

        const isConnectedSite = connectedWebsites.some(site => {
            if(typeof site === "string")
                return site === origin

            if(site && typeof site === "object" && typeof site.origin === "string")
                return site.origin === origin

            return false
        })

        if(!isConnectedSite){
            sendResponse(false)
            return
        }

        if(baseWallet === undefined){
            sendResponse(false)
            return
        }
        try {
            web3.eth.net.isListening().then(listening => {
                sendResponse(listening)
            })
        }catch(e){
            sendResponse(true)
        }
    }

    static _resolveRequestOrigin(request, sender){
        if(request && typeof request.origin === "string")
            return request.origin

        if(sender && sender.tab && typeof sender.tab.url === "string"){
            try {
                return new URL(sender.tab.url).origin
            }catch(e){
                return undefined
            }
        }

        return undefined
    }

}

Web3Handlers.register()
