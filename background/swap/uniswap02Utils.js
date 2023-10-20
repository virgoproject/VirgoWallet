class Uniswap02Utils {

    static baseSwapFee = 0.01
    static defaultSwapGas = 600000
    static additionalGas = 50000

    static async estimateSwapFees(dexParams, amount, quote){
        console.log("uni02")

        const initialRoute = quote.routes[0].route

        const route = []

        for(const node of initialRoute){
            if(node == baseWallet.getCurrentWallet().ticker){
                route.push(dexParams.params.WETH)
                continue
            }

            route.push(node)
        }

        const proxy = new web3.eth.Contract(VIRGOSWAP_ABI, dexParams.params.proxyAddress, { from: baseWallet.getCurrentAddress()});

        const minOut = web3.utils.toBN(quote.routes[0].amount).mul(web3.utils.toBN(quote.taxA)).div(web3.utils.toBN("1000")).mul(web3.utils.toBN(quote.taxB)).div(web3.utils.toBN("1000"))

        if(initialRoute[0] == baseWallet.getCurrentWallet().ticker)
            return {
                gas: await proxy.methods.swapExactETHForTokens(dexParams.params.routerAddress, route, minOut).estimateGas({from: baseWallet.getCurrentAddress(), value: amount}) + this.additionalGas,
                feesRate: this.baseSwapFee + (route.length-1)*dexParams.params.feesRate
            }

        const token = new web3.eth.Contract(ERC20_ABI, route[0], { from: baseWallet.getCurrentAddress()});

        const allowance = await token.methods.allowance(baseWallet.getCurrentAddress(), dexParams.params.proxyAddress).call()

        if(web3.utils.toBN(allowance).lt(amount)){
            return {
                gas: this.defaultSwapGas + await token.methods.approve(dexParams.params.proxyAddress, web3.utils.toBN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).estimateGas(),
                feesRate: this.baseSwapFee + (route.length-1)*dexParams.params.feesRate
            }
        }

        if(initialRoute[initialRoute.length-1] == baseWallet.getCurrentWallet().ticker)
            return {
                gas: await proxy.methods.swapExactTokensForETH(dexParams.params.routerAddress, amount, route, minOut).estimateGas({ from: baseWallet.getCurrentAddress()}) + this.additionalGas,
                feesRate: this.baseSwapFee + (route.length-1)*dexParams.params.feesRate
            }

        return {
            gas: await proxy.methods.swapExactTokensForTokens(dexParams.params.routerAddress, amount, route, minOut).estimateGas({ from: baseWallet.getCurrentAddress()}) + this.additionalGas,
            feesRate: this.baseSwapFee + (route.length-1)*dexParams.params.feesRate
        }

    }

    static async initSwap(dexParams, amount, quote, gasPrice){
        const _this = this

        const initialRoute = quote.routes[0].route

        const route = []

        for(const node of initialRoute){
            if(node == baseWallet.getCurrentWallet().ticker){
                route.push(dexParams.params.WETH)
                continue
            }

            route.push(node)
        }

        const proxy = new web3.eth.Contract(VIRGOSWAP_ABI, dexParams.params.proxyAddress, { from: baseWallet.getCurrentAddress()});

        const minOut = web3.utils.toBN(quote.routes[0].amount).mul(web3.utils.toBN(quote.taxA)).div(web3.utils.toBN("1000")).mul(web3.utils.toBN(quote.taxB)).div(web3.utils.toBN("1000"))

        let nonce = await web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending")

        return await new Promise(resolve => {

            const swapExactETHForToken = function(){
                proxy.methods.swapExactETHForTokens(dexParams.params.routerAddress, route, minOut).estimateGas({value: amount, from: baseWallet.getCurrentAddress()}).then(gas => {
                    gas += _this.additionalGas
                    proxy.methods.swapExactETHForTokens(dexParams.params.routerAddress, route, minOut).send({value: amount, nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {
                        baseWallet.getCurrentWallet().transactions.unshift({
                            "hash": hash,
                            "contractAddr": "SWAP",
                            "date": Date.now(),
                            "recipient": dexParams.params.proxyAddress,
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
            }

            if(initialRoute[0] == baseWallet.getCurrentWallet().ticker){
                swapExactETHForToken()
                return
            }

            const token = new web3.eth.Contract(ERC20_ABI, route[0], { from: baseWallet.getCurrentAddress()})

            const swapExactTokensForETH = function(approveHash, gas){
                proxy.methods.swapExactTokensForETH(dexParams.params.routerAddress, amount, route, minOut).send({nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {
                    baseWallet.getCurrentWallet().transactions.unshift({
                        "hash": hash,
                        "contractAddr": "SWAP",
                        "date": Date.now(),
                        "recipient": dexParams.params.proxyAddress,
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

            const swapExactTokensForTokens = function(approveHash, gas){
                proxy.methods.swapExactTokensForTokens(dexParams.params.routerAddress, amount, route, minOut).send({nonce: nonce, gasPrice: gasPrice, from: baseWallet.getCurrentAddress(), gas: gas}).on("transactionHash", hash => {
                    baseWallet.getCurrentWallet().transactions.unshift({
                        "hash": hash,
                        "contractAddr": "SWAP",
                        "date": Date.now(),
                        "recipient": dexParams.params.proxyAddress,
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
                if(initialRoute[initialRoute.length-1].toLowerCase() == baseWallet.getCurrentWallet().ticker){
                    proxy.methods.swapExactTokensForETH(dexParams.params.routerAddress, amount, route, minOut).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                        swapExactTokensForETH(approveHash, gas + _this.additionalGas)
                    })
                    return
                }
                proxy.methods.swapExactTokensForTokens(dexParams.params.routerAddress, amount, route, minOut).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                    swapExactTokensForTokens(approveHash, gas + _this.additionalGas)
                })
            }

            const swap = function (approveHash){
                if(initialRoute[initialRoute.length-1].toLowerCase() == baseWallet.getCurrentWallet().ticker){
                    swapExactTokensForETH(approveHash, _this.defaultSwapGas)
                    return
                }
                swapExactTokensForTokens(approveHash, _this.defaultSwapGas)
            }

            token.methods.allowance(baseWallet.getCurrentAddress(), dexParams.params.proxyAddress).call().then(allowance => {
                if(web3.utils.toBN(allowance).lt(amount)){
                    token.methods.approve(dexParams.params.proxyAddress, web3.utils.toBN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).estimateGas().then(gas => {
                        token.methods.approve(dexParams.params.proxyAddress, web3.utils.toBN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).send({nonce: nonce, gasPrice: gasPrice, gas: gas}).on("transactionHash", hash => {
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
