class SwapHandlers {

    static register(){
        addBgMessageHandler("getSwapRoute", this.getSwapRoute)
        addBgMessageHandler("estimateSwapFees", this.estimateSwapFees)
        addBgMessageHandler("initSwap", this.initSwap)
    }

    static getSwapRoute(request, sender, sendResponse){
        let decimals = baseWallet.getCurrentWallet().tokenSet.get(request.token1)

        if(decimals === undefined)
            decimals = baseWallet.getCurrentWallet().decimals
        else
            decimals = decimals.decimals

        /**if(request.token1 == baseWallet.getCurrentWallet().ticker)
         request.token1 = baseWallet.getCurrentWallet().contract
         else if(request.token2 == baseWallet.getCurrentWallet().ticker)
         request.token2 = baseWallet.getCurrentWallet().contract**/

        baseWallet.getCurrentWallet().getSwapRoute(
            web3.utils.toBN(Utils.toAtomicString(request.amount, decimals)),
            request.token1,
            request.token2
        ).then(function(resp){
            sendResponse(resp)
        })
    }

    static estimateSwapFees(request, sender, sendResponse){
        let decimals2 = baseWallet.getCurrentWallet().tokenSet.get(request.quote.routes[0].route[0])

        if(decimals2 === undefined)
            decimals2 = baseWallet.getCurrentWallet().decimals
        else
            decimals2 = decimals2.decimals

        baseWallet.getCurrentWallet().estimateSwapFees(
            web3.utils.toBN(Utils.toAtomicString(request.amount, decimals2)),
            request.quote
        ).then(function(resp){
            sendResponse(resp)
        })
    }

    static initSwap(request, sender, sendResponse){
        let decimals3 = baseWallet.getCurrentWallet().tokenSet.get(request.quote.routes[0].route[0])

        if(decimals3 === undefined)
            decimals3 = baseWallet.getCurrentWallet().decimals
        else
            decimals3 = decimals3.decimals

        baseWallet.getCurrentWallet().initSwap(
            web3.utils.toBN(Utils.toAtomicString(request.amount, decimals3)),
            request.quote,
            request.gasPrice
        ).then(function(resp){
            baseWallet.getCurrentWallet().changeTracking(request.quote.routes[0].route[request.quote.routes[0].route.length-1], true)
            sendResponse(true)
        })
    }



}

SwapHandlers.register()
