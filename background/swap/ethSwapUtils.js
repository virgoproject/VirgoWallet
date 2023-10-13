class EthSwapUtils {

    constructor(chainID, params) {
        this.chainID = chainID
        this.params = params
    }

    async getSwapRoute(amount, token1, token2){
        try {
            const req = await fetch("https://swap.virgo.net/api/v1/quote/"+this.chainID+"/"+token1+"/"+token2+"/"+amount)
            const json = await req.json()

            if(json.error != undefined || json.routes === undefined)
                return json

            const finalRoutes = []

            for(const res of json.routes){
                if(res.index < this.params.length)
                    finalRoutes.push(res)
            }

            if(finalRoutes.length == 0)
                json.error = true

            json.routes = finalRoutes

            console.log(json)

            return json

        }catch (e) {
            return false
        }
    }

    async estimateSwapFees(amount, quote){
        const dexParams = this.params[quote.routes[0].index]

        switch(dexParams.type){
            case "uni02":
                return await Uniswap02Utils.estimateSwapFees(dexParams, amount, quote)
            case "uni03":
                return await Uniswap03Utils.estimateSwapFees(dexParams, amount, quote)
        }

    }

    async initSwap(amount, quote, gasPrice){
        const dexParams = this.params[quote.routes[0].index]

        switch(dexParams.type){
            case "uni02":
                return await Uniswap02Utils.initSwap(dexParams, amount, quote, gasPrice)
            case "uni03":
                return await Uniswap03Utils.initSwap(dexParams, amount, quote, gasPrice)
        }

    }

    async updateTransactionStatus(transaction, receipt){
        const _this = this

        const txData = await web3.eth.getTransaction(transaction.hash)

        const method = abiDecoder.decodeMethod(txData.input)

        console.log(method.name)

        switch(method.name){
            case "swapExactETHForTokens":
                await _this.getStatusForUni02TokenOut(transaction, receipt)
                break
            case "swapExactTokensForETH":
                await _this.getStatusForSwapExactTokensForETH(transaction, receipt)
                break
            case "swapExactTokensForTokens":
                await _this.getStatusForUni02TokenOut(transaction, receipt)
                break
            default:
                throw new Error("fuck shit")
        }

        browser.notifications.create("txNotification", {
            "type": "basic",
            "title": "Swap successful!",
            "iconUrl": browser.runtime.getURL("/ui/images/walletLogo.png"),
            "message": "Transaction " + transaction.hash + " confirmed"
        })

    }

    async getStatusForUni02TokenOut(transaction, receipt){
        const logs = abiDecoder.decodeLogs(receipt.logs)

        for(const log of logs){
            if(log.name == "Transfer" && log.address.toLowerCase() == transaction.swapInfos.route[transaction.swapInfos.route.length-1].toLowerCase()){
                for(const event of log.events){
                    if(event.name == "to" && event.value.toLowerCase() != baseWallet.getCurrentAddress().toLowerCase()) break
                    if(event.name == "value"){
                        transaction.swapInfos.amountOut = event.value
                        return
                    }
                }
            }
        }
    }

    async getStatusForSwapExactTokensForETH(transaction, receipt){
        const logs = abiDecoder.decodeLogs(receipt.logs)

        for(const log of logs){
            if(log.name == "Received" && log.address.toLowerCase() == transaction.recipient.toLowerCase()){
                for(const event of log.events){
                    if(event.name == "amount"){
                        transaction.swapInfos.amountOut = web3.utils.toBN(event.value).mul(web3.utils.toBN((1-Uniswap02Utils.baseSwapFee)*1000)).div(web3.utils.toBN("1000")).toString()
                        return
                    }
                }
            }
        }

    }

}
