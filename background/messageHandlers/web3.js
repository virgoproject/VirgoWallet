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

}

Web3Handlers.register()
