class EthSwapUtils {

    constructor(chain) {
        this.chain = chain
        this.chainID = chain.chainID
        this.params = chain.swapV2Params
        this.uni02Utils = new Uniswap02Utils(chain)
        this.uni03Utils = new Uniswap03Utils(chain)
        this.web3 = baseWallet.getWeb3ByID(chain.chainID)
    }

    async getSwapRoute(amount, token1, token2){

        //Wrap ETH
        if(token1 == this.chain.ticker && token2.toLowerCase() == this.chain.contract.toLowerCase()){
            return {
                routes: [
                    {
                        route: [token1, token2],
                        amount: amount,
                        index: -1
                    }
                ],
                taxA: 0,
                taxB: 0
            }
        }

        //Unwrap WETH
        if(token1.toLowerCase() == this.chain.contract.toLowerCase() && token2 == this.chain.ticker){
            return {
                routes: [
                    {
                        route: [token1, token2],
                        amount: amount,
                        index: -1
                    }
                ],
                taxA: 0,
                taxB: 0
            }
        }

        try {
            const req = await fetch("https://swap.virgo.net/api/v2/quote/"+this.chainID+"/"+token1+"/"+this.chainID+"/"+token2+"/"+amount)
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

            return json

        }catch (e) {
            return false
        }
    }

    async estimateSwapFees(amount, quote){

        //Wrap ETH
        if(quote.routes[0].route[0] == this.chain.ticker && quote.routes[0].route[quote.routes[0].route.length-1].toLowerCase() == this.chain.contract.toLowerCase()){
            return await this.estimateWrapFees(amount)
        }

        //Unwrap WETH
        if(quote.routes[0].route[0].toLowerCase() == this.chain.contract.toLowerCase() && quote.routes[0].route[quote.routes[0].route.length-1] == this.chain.ticker){
            return await this.estimateUnwrapFees(amount)
        }

        const dexParams = this.params[quote.routes[0].index]

        switch(dexParams.type){
            case "uni02":
                return await this.uni02Utils.estimateSwapFees(dexParams, amount, quote)
            case "uni03":
                return await this.uni03Utils.estimateSwapFees(dexParams, amount, quote)
        }

    }

    async initSwap(amount, quote, gasPrice){

        //Wrap ETH
        if(quote.routes[0].route[0] == this.chain.ticker && quote.routes[0].route[quote.routes[0].route.length-1].toLowerCase() == this.chain.contract.toLowerCase()){
            return await this.initWrap(amount, gasPrice)
        }

        //Unwrap WETH
        if(quote.routes[0].route[0].toLowerCase() == this.chain.contract.toLowerCase() && quote.routes[0].route[quote.routes[0].route.length-1] == this.chain.ticker){
            return await this.initUnwrap(amount, gasPrice)
        }

        const dexParams = this.params[quote.routes[0].index]

        switch(dexParams.type){
            case "uni02":
                return await this.uni02Utils.initSwap(dexParams, amount, quote, gasPrice)
            case "uni03":
                return await this.uni03Utils.initSwap(dexParams, amount, quote, gasPrice)
        }

    }

    async updateTransactionStatus(transaction, receipt){
        const _this = this

        const txData = await this.web3.eth.getTransaction(transaction.hash)

        const method = abiDecoder.decodeMethod(txData.input)

        switch(method.name){
            case "swapExactETHForTokens":
            case "swapExactTokensForTokens":
            case "univ3_swapExactTokensForTokensSingle":
            case "univ3_swapExactTokensForTokens":
            case "univ3_swapExactETHForTokensSingle":
            case "univ3_swapExactETHForTokens":
                await _this.getStatusForTokenOut(transaction, receipt)
                break
            case "swapExactTokensForETH":
            case "univ3_swapExactTokensForETHSingle":
            case "univ3_swapExactTokensForETH":
                await _this.getStatusForETHOut(transaction, receipt)
                break
        }

        browser.notifications.create("txNotification", {
            "type": "basic",
            "title": "Swap successful!",
            "iconUrl": browser.runtime.getURL("/ui/images/walletLogo.png"),
            "message": "Transaction " + transaction.hash + " confirmed"
        })

    }

    async getStatusForTokenOut(transaction, receipt){
        const logs = abiDecoder.decodeLogs(receipt.logs)

        let route = transaction.swapInfos.route

        if(transaction.swapInfos.route.route !== undefined)
            route = transaction.swapInfos.route.route

        for(const log of logs){
            if(log.name == "Transfer" && log.address.toLowerCase() == route[route.length-1].toLowerCase()){
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

    async getStatusForETHOut(transaction, receipt){
        const logs = abiDecoder.decodeLogs(receipt.logs)

        for(const log of logs){
            if(log.name == "Received" && log.address.toLowerCase() == transaction.recipient.toLowerCase()){
                for(const event of log.events){
                    if(event.name == "amount"){
                        transaction.swapInfos.amountOut = (BigInt(event.value) * BigInt((1-Uniswap02Utils.baseSwapFee)*1000) / 1000n).toString()
                        return
                    }
                }
            }
        }

    }

    async estimateWrapFees(amount){
        const weth = new this.web3.eth.Contract(WETH_ABI, this.chain.contract, { from: baseWallet.getCurrentAddress()});

        return {
            gas: await weth.methods.deposit().estimateGas({from: baseWallet.getCurrentAddress(), value: amount}),
            feesRate: 0
        }
    }

    async estimateUnwrapFees(amount){
        const weth = new this.web3.eth.Contract(WETH_ABI, this.chain.contract, { from: baseWallet.getCurrentAddress()});

        return {
            gas: await weth.methods.withdraw(amount).estimateGas({from: baseWallet.getCurrentAddress()}),
            feesRate: 0
        }
    }

    async initWrap(amount, gasPrice){
        const _this = this

        const weth = new this.web3.eth.Contract(WETH_ABI, this.chain.contract, { from: baseWallet.getCurrentAddress()});

        let nonce = await this.web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending")

        let gas = await weth.methods.deposit().estimateGas({from: baseWallet.getCurrentAddress(), value: amount})

        return await new Promise(resolve => {
            weth.methods.deposit().send({from: baseWallet.getCurrentAddress(), value: amount, gasPrice, gas, nonce}).on("transactionHash", hash => {
                _this.chain.transactions.unshift({
                    "hash": hash,
                    "contractAddr": "WRAP",
                    "date": Date.now(),
                    "recipient": _this.chain.contract,
                    "amount": amount,
                    "gasPrice": gasPrice,
                    "gasLimit": gas,
                    "nonce": nonce,
                })
                baseWallet.save()
                resolve(true)
            })
        })
    }

    async initUnwrap(amount, gasPrice){
        const _this = this

        const weth = new this.web3.eth.Contract(WETH_ABI, this.chain.contract, { from: baseWallet.getCurrentAddress()});

        let nonce = await this.web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending")

        let gas = await weth.methods.withdraw(amount).estimateGas({from: baseWallet.getCurrentAddress()})

        return await new Promise(resolve => {
            weth.methods.withdraw(amount).send({from: baseWallet.getCurrentAddress(), gasPrice, gas, nonce}).on("transactionHash", hash => {
                _this.chain.transactions.unshift({
                    "hash": hash,
                    "contractAddr": "UNWRAP",
                    "date": Date.now(),
                    "recipient": _this.chain.contract,
                    "amount": amount,
                    "gasPrice": gasPrice,
                    "gasLimit": gas,
                    "nonce": nonce,
                })
                baseWallet.save()
                resolve(true)
            })
        })
    }

}
