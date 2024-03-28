class SwapHandlers {

    static register(){
        addBgMessageHandler("getSwapRoute", this.getSwapRoute)
        addBgMessageHandler("estimateSwapFees", this.estimateSwapFees)
        addBgMessageHandler("initSwap", this.initSwap)
    }

    static getSwapRoute(request, sender, sendResponse){
        CrossSwapUtils.getSwapRoute(
            request.chainIn,
            request.tokenIn,
            request.chainOut,
            request.tokenOut,
            web3.utils.toBN(request.amount)
        ).then(function(resp){
            sendResponse(resp)
        })
    }

    static estimateSwapFees(request, sender, sendResponse){
        CrossSwapUtils.estimateSwapFees(
            request.chainIn,
            request.tokenIn,
            request.chainOut,
            request.tokenOut,
            web3.utils.toBN(request.amount),
            request.quote
        ).then(function(resp){
            sendResponse(resp)
        })
    }

    static initSwap(request, sender, sendResponse){
        CrossSwapUtils.initSwap(
            request.chainIn,
            request.tokenIn,
            request.chainOut,
            request.tokenOut,
            web3.utils.toBN(request.amount),
            request.quote,
            request.gasLimit,
            request.gasPrice
        ).then(function(resp){
            //baseWallet.getCurrentWallet().changeTracking(request.quote.routes[0].route[request.quote.routes[0].route.length-1], true)
            sendResponse(true)
        })
    }



}

SwapHandlers.register()
