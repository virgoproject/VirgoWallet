class AtomicSwapHandlers {

    static register(){
        addBgMessageHandler("estimateAtomicSwapFees", this.estimateAtomicSwapFees)
        addBgMessageHandler("initAtomicSwap", this.initAtomicSwap)
    }

    static estimateAtomicSwapFees(request, sender, sendResponse){
        sendResponse(AtomicSwapUtils.estimateLockFees(request.chainID))
    }

    static initAtomicSwap(request, sender, sendResponse){
        let chainDecimals = baseWallet.getChainByID(request.chainA).decimals

        AtomicSwapUtils.initAtomicSwap(
            web3.utils.toBN(Utils.toAtomicString(request.amount, chainDecimals)),
            request.chainA,
            request.chainB,
            request.gasPrice
        ).then(function(res){
            sendResponse(true)
        })
    }
    
}

AtomicSwapHandlers.register()
