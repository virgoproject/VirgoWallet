class SwapHandlers {

    static register(){
        addBgMessageHandler("getSwapRoute", this.getSwapRoute)
        addBgMessageHandler("estimateSwapFees", this.estimateSwapFees)
        addBgMessageHandler("initSwap", this.initSwap)
        addBgMessageHandler("getCrossSwaps", this.getCrossSwaps)
        addBgMessageHandler("getCrossSwap", this.getCrossSwap)
        addBgMessageHandler("getFiatTokens", this.getFiatTokens)
        addBgMessageHandler("createTransakOrder", this.createTransakOrder)
    }

    static getSwapRoute(request, sender, sendResponse){
        CrossSwapUtils.getSwapRoute(
            request.chainIn,
            request.tokenIn,
            request.chainOut,
            request.tokenOut,
            new BN(request.amount)
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
            new BN(request.amount),
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
            new BN(request.amount),
            request.quote,
            request.gasLimit,
            request.gasPrice
        ).then(function(resp){
            //baseWallet.getCurrentWallet().changeTracking(request.quote.routes[0].route[request.quote.routes[0].route.length-1], true)
            sendResponse(true)
        })
    }

    static getCrossSwaps(request, sender, sendResponse){
        sendResponse(baseWallet.crossSwaps)
    }

    static getCrossSwap(request, sender, sendResponse){
        for(const swap of baseWallet.crossSwaps){
            if(swap.hash == request.hash){
                sendResponse(swap)
                return
            }
        }

        sendResponse(false)
    }

    static getFiatTokens(request, sender, sendResponse){
        sendResponse([
            {
                chainID: "FIAT",
                chainName: "Fiat",
                contract: "EUR",
                decimals: 0,
                name: "Euro",
                ticker: "EUR"
            },
            {
                chainID: "FIAT",
                chainName: "Fiat",
                contract: "USD",
                decimals: 0,
                name: "US Dollar",
                ticker: "USD"
            },
        ])
    }

    static createTransakOrder(request, sender, sendResponse){
        baseWallet.crossSwaps.unshift({
            hash: "0x"+request.orderId,
            contractAddr: "TRANSAK",
            "date": Date.now(),
            amount: request.amountIn,
            origin: "Virgo Swap",
            from: baseWallet.getCurrentAddress(),
            cross: true,
            swapInfos: {
                chainA: request.tokenIn.chainID,
                tokenA: request.tokenIn.contract,
                chainB: request.tokenOut.chainID,
                tokenB: request.tokenOut.contract,
                orderID: request.orderId,
                quote: request.route,
                trStatus: "AWAITING_PAYMENT_FROM_USER",
                status: 0,
                amountIn: request.amountIn
            },
        })

        baseWallet.save()
    }

}

SwapHandlers.register()
