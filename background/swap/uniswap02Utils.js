class Uniswap02Utils {

    constructor(proxyAddress, routerAddress, factoryAddress, tokens, feesRate) {
        this.proxyAddress = proxyAddress
        this.routerAddress = routerAddress
        this.factoryAddress = factoryAddress
        this.feesRate = feesRate

        this.router = new web3.eth.Contract(UNI_ROUTER02, routerAddress)
        this.factory = new web3.eth.Contract(UNI_FACTORY, factoryAddress)
        this.proxy = new web3.eth.Contract(VIRGOSWAP, proxyAddress)

        this.tokens = tokens

        this.defaultSwapGas = 600000
        this.additionalGas = 50000
        this.baseSwapFee = 0.01
    }

    async findRoute(amount, tokenA, tokenB) {
        console.log(amount)
        console.log(tokenA)
        console.log(tokenB)

        const WETH = await this.getWETH()

        let bestRoute = null;

        const directPair = await this.factory.methods.getPair(tokenA, tokenB).call() != "0x0000000000000000000000000000000000000000"
        if(directPair)
            bestRoute = {
                route: [tokenA, tokenB],
                amount: await this.getAmountOut(amount, [tokenA, tokenB])
            }


        const pairA_WETH = await this.factory.methods.getPair(tokenA, WETH).call() != "0x0000000000000000000000000000000000000000"
        const pairB_WETH = await this.factory.methods.getPair(tokenB, WETH).call() != "0x0000000000000000000000000000000000000000"

        if(pairA_WETH && pairB_WETH){
            const pairAmount = await this.getAmountOut(amount, [tokenA, WETH, tokenB])
            if(bestRoute == null || bestRoute.amount.lt(pairAmount))
                bestRoute = {
                    route: [tokenA, WETH, tokenB],
                    amount: pairAmount
                }
        }

        for(const token of this.tokens){
            if(tokenA == token || tokenB == token)
                continue

            const A_token = await this.factory.methods.getPair(tokenA, token).call() != "0x0000000000000000000000000000000000000000"
            const B_token = await this.factory.methods.getPair(tokenB, token).call() != "0x0000000000000000000000000000000000000000"

            if(A_token && B_token){
                const pairAmount = await this.getAmountOut(amount, [tokenA, token, tokenB])
                if(bestRoute == null || bestRoute.amount.lt(pairAmount))
                    bestRoute = {
                        route: [tokenA, token, tokenB],
                        amount: pairAmount
                    }
            }

            if((A_token && B_token && pairA_WETH) || (!A_token && B_token && pairA_WETH) && tokenB != WETH){
                const pairAmount = await this.getAmountOut(amount, [tokenA, WETH, token, tokenB])
                if(bestRoute == null || bestRoute.amount.lt(pairAmount))
                    bestRoute = {
                        route: [tokenA, WETH, token, tokenB],
                        amount: pairAmount
                    }
            }

            if((A_token && B_token && pairB_WETH) || (A_token && !B_token && pairB_WETH) && tokenA != WETH){
                const pairAmount = await this.getAmountOut(amount, [tokenA, token, WETH, tokenB])
                if(bestRoute == null || bestRoute.amount.lt(pairAmount))
                    bestRoute = {
                        route: [tokenA, token, WETH, tokenB],
                        amount: pairAmount
                    }
            }

            if(pairA_WETH && pairB_WETH){
                const pairAmount = await this.getAmountOut(amount, [tokenA, WETH, token, WETH, tokenB])
                if(bestRoute == null || bestRoute.amount.lt(pairAmount))
                    bestRoute = {
                        route: [tokenA, WETH, token, WETH, tokenB],
                        amount: pairAmount
                    }
            }

        }

        console.log(bestRoute)

        return bestRoute
    }

    async getAmountOut(amount, route){
        const amountOut = await this.router.methods.getAmountsOut(amount, route).call()
        return web3.utils.toBN(amountOut[amountOut.length-1])
    }

    async estimateSwapFees(amount, route){
        const WETH = await this.getWETH()

        if(route[0].toLowerCase() == WETH.toLowerCase())
            return {
                gas: await this.proxy.methods.swapExactBNBForToken(route).estimateGas({from: baseWallet.getCurrentAddress(), value: amount}) + this.additionalGas,
                feesRate: this.baseSwapFee + (route.length-1)*this.feesRate
            }

        const token = new web3.eth.Contract(ERC20_ABI, route[0], { from: baseWallet.getCurrentAddress()});

        const allowance = await token.methods.allowance(baseWallet.getCurrentAddress(), this.proxyAddress).call()

        if(web3.utils.toBN(allowance).lt(amount)){
            return {
                gas: this.defaultSwapGas + await token.methods.approve(this.proxyAddress, web3.utils.toBN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).estimateGas(),
                feesRate: this.baseSwapFee + (route.length-1)*this.feesRate
            }
        }

        if(route[route.length-1].toLowerCase() == WETH.toLowerCase())
            return {
                gas: await this.proxy.methods.swapExactTokenForBNB(amount, route).estimateGas({ from: baseWallet.getCurrentAddress()}) + this.additionalGas,
                feesRate: this.baseSwapFee + (route.length-1)*this.feesRate
            }

        return {
            gas: await this.proxy.methods.swapExactTokenForToken(amount, route).estimateGas({ from: baseWallet.getCurrentAddress()}) + this.additionalGas,
            feesRate: this.baseSwapFee + (route.length-1)*this.feesRate
        }

    }

    async getWETH(){
        if(this.WETH === undefined)
            this.WETH = await this.router.methods.WETH().call()

        return this.WETH
    }

    async initSwap(amount, route, gasPrice){
        const _this = this

        const WETH = await this.getWETH()

        let nonce = await web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending")

        return await new Promise(resolve => {

            if(route[0].toLowerCase() == WETH.toLowerCase()){
                console.log("swapExactBNBForToken")
                _this.proxy.methods.swapExactBNBForToken(route).estimateGas({value: amount, from: baseWallet.getCurrentAddress()}).then(gas => {
                    gas += this.additionalGas
                    _this.proxy.methods.swapExactBNBForToken(route).send({value: amount, nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {
                        baseWallet.getCurrentWallet().transactions.unshift({
                            "hash": hash,
                            "contractAddr": "SWAP",
                            "date": Date.now(),
                            "recipient": _this.proxyAddress,
                            "amount": 0,
                            "gasPrice": gasPrice,
                            "gasLimit": gas,
                            "nonce": nonce,
                            "swapInfos": {
                                "route": route,
                                "amountIn": amount.toString(),
                                "approveHash": ""
                            }
                        })
                        baseWallet.save()
                        resolve(true)
                    })
                })
                return
            }

            const token = new web3.eth.Contract(ERC20_ABI, route[0], { from: baseWallet.getCurrentAddress()})

            const swapExactTokenForBNB = function(approveHash, gas){
                _this.proxy.methods.swapExactTokenForBNB(amount, route).send({nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {
                    baseWallet.getCurrentWallet().transactions.unshift({
                        "hash": hash,
                        "contractAddr": "SWAP",
                        "date": Date.now(),
                        "recipient": _this.proxyAddress,
                        "amount": 0,
                        "gasPrice": gasPrice,
                        "gasLimit": gas,
                        "nonce": nonce,
                        "swapInfos": {
                            "route": route,
                            "amountIn": amount.toString(),
                            "approveHash": approveHash
                        }
                    })
                    baseWallet.save()
                    resolve(true)
                })
            }

            const swapExactTokenForToken = function(approveHash, gas){
                _this.proxy.methods.swapExactTokenForToken(amount, route).send({nonce: nonce, gasPrice: gasPrice, from: baseWallet.getCurrentAddress(), gas: gas}).on("transactionHash", hash => {
                    baseWallet.getCurrentWallet().transactions.unshift({
                        "hash": hash,
                        "contractAddr": "SWAP",
                        "date": Date.now(),
                        "recipient": _this.proxyAddress,
                        "amount": 0,
                        "gasPrice": gasPrice,
                        "gasLimit": gas,
                        "nonce": nonce,
                        "swapInfos": {
                            "route": route,
                            "amountIn": amount.toString(),
                            "approveHash": approveHash
                        }
                    })
                    baseWallet.save()
                    resolve(true)
                })
            }

            const estimateGas = function (approveHash){
                if(route[route.length-1].toLowerCase() == WETH.toLowerCase()){
                    _this.proxy.methods.swapExactTokenForBNB(amount, route).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                        swapExactTokenForBNB(approveHash, gas + _this.additionalGas)
                    })
                    return
                }
                _this.proxy.methods.swapExactTokenForToken(amount, route).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                    swapExactTokenForToken(approveHash, gas + _this.additionalGas)
                })
            }

            const swap = function (approveHash){
                if(route[route.length-1].toLowerCase() == WETH.toLowerCase()){
                    swapExactTokenForBNB(approveHash, _this.defaultSwapGas)
                    return
                }
                swapExactTokenForToken(approveHash, _this.defaultSwapGas)
            }

            token.methods.allowance(baseWallet.getCurrentAddress(), this.proxyAddress).call().then(allowance => {
                if(web3.utils.toBN(allowance).lt(amount)){
                    token.methods.approve(this.proxyAddress, web3.utils.toBN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).estimateGas().then(gas => {
                        token.methods.approve(this.proxyAddress, web3.utils.toBN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).send({nonce: nonce, gasPrice: gasPrice, gas: gas}).on("transactionHash", hash => {
                            nonce++
                            swap(hash)
                        })
                    })
                    return
                }
                estimateGas("")
            })

        })

    }

}
