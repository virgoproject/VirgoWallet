class Uniswap03Utils {

    static defaultSwapGas = 600000
    static additionalGas = 50000
    static baseSwapFee = 0.01

    static async estimateSwapFees(dexParams, amount, quote){
        if(quote.routes[0].route.length == 2)
            return await this.estimateSwapFees_single(dexParams, amount, quote)

        return await this.estimateSwapFees_multi(dexParams, amount, quote)
    }

    static async estimateSwapFees_single(dexParams, amount, quote){
        console.log("uni03single")
        const route = quote.routes[0]

        const proxy = new web3.eth.Contract(VIRGOSWAP_ABI, dexParams.params.proxyAddress, { from: baseWallet.getCurrentAddress()});

        const minOut = web3.utils.toBN(quote.routes[0].amount).mul(web3.utils.toBN(quote.taxA)).div(web3.utils.toBN("1000")).mul(web3.utils.toBN(quote.taxB)).div(web3.utils.toBN("1000"))

        let cumuledFees = this.baseSwapFee
        for(let fee of route.fees){
            console.log(fee)
            cumuledFees+=(fee/1000000)
        }

        if(route.route[0].toLowerCase() == dexParams.params.WETH.toLowerCase())
            return {
                gas: await proxy.methods.univ3_swapExactETHForTokensSingle(dexParams.params.routerAddress, route.route, route.fees[0], minOut).estimateGas({from: baseWallet.getCurrentAddress(), value: amount}) + this.additionalGas,
                feesRate: cumuledFees
            }

        const token = new web3.eth.Contract(ERC20_ABI, route.route[0], { from: baseWallet.getCurrentAddress()});

        const allowance = await token.methods.allowance(baseWallet.getCurrentAddress(), dexParams.params.proxyAddress).call()

        if(web3.utils.toBN(allowance).lt(amount)){
            return {
                gas: this.defaultSwapGas + await token.methods.approve(dexParams.params.proxyAddress, web3.utils.toBN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).estimateGas(),
                feesRate: cumuledFees
            }
        }

        if(route.route[route.route.length-1].toLowerCase() == dexParams.params.WETH.toLowerCase())
            return {
                gas: await proxy.methods.univ3_swapExactTokensForETHSingle(dexParams.params.routerAddress, amount, route.route, route.fees[0], minOut).estimateGas({ from: baseWallet.getCurrentAddress()}) + this.additionalGas,
                feesRate: cumuledFees
            }

        return {
            gas: await proxy.methods.univ3_swapExactTokensForTokensSingle(dexParams.params.routerAddress, amount, route.route, route.fees[0], minOut).estimateGas({ from: baseWallet.getCurrentAddress()}) + this.additionalGas,
            feesRate: cumuledFees
        }
    }

    static async estimateSwapFees_multi(dexParams, amount, quote){
        console.log("uni03multi")

        const route = quote.routes[0]

        const proxy = new web3.eth.Contract(VIRGOSWAP_ABI, dexParams.params.proxyAddress, { from: baseWallet.getCurrentAddress()});

        const minOut = web3.utils.toBN(quote.routes[0].amount).mul(web3.utils.toBN(quote.taxA)).div(web3.utils.toBN("1000")).mul(web3.utils.toBN(quote.taxB)).div(web3.utils.toBN("1000"))

        const path = this.encodePath(route.route, route.fees)

        let cumuledFees = this.baseSwapFee
        for(let fee of route.fees){
            console.log(fee)
            cumuledFees+=(fee/1000000)
        }

        if(route.route[0].toLowerCase() == dexParams.params.WETH.toLowerCase())
            return {
                gas: await proxy.methods.univ3_swapExactETHForTokens(dexParams.params.routerAddress, path, minOut).estimateGas({from: baseWallet.getCurrentAddress(), value: amount}) + this.additionalGas,
                feesRate: cumuledFees
            }

        const token = new web3.eth.Contract(ERC20_ABI, route.route[0], { from: baseWallet.getCurrentAddress()});

        const allowance = await token.methods.allowance(baseWallet.getCurrentAddress(), dexParams.params.proxyAddress).call()

        if(web3.utils.toBN(allowance).lt(amount)){
            return {
                gas: this.defaultSwapGas + await token.methods.approve(dexParams.params.proxyAddress, web3.utils.toBN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).estimateGas(),
                feesRate: cumuledFees
            }
        }

        if(route.route[route.route.length-1].toLowerCase() == dexParams.params.WETH.toLowerCase())
            return {
                gas: await proxy.methods.univ3_swapExactTokensForETH(dexParams.params.routerAddress, amount, route.route[0], path, minOut).estimateGas({ from: baseWallet.getCurrentAddress()}) + this.additionalGas,
                feesRate: cumuledFees
            }

        return {
            gas: await proxy.methods.univ3_swapExactTokensForTokens(dexParams.params.routerAddress, amount, route.route[0], path, minOut).estimateGas({ from: baseWallet.getCurrentAddress()}) + this.additionalGas,
            feesRate: cumuledFees
        }
    }

    async initSwap(amount, route, gasPrice){
        const _this = this

        const WETH = await this.getWETH()

        let nonce = await web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending")

        let identifier = ""
        for(let step of route)
            identifier+=step

        const fees = this.feesByRoutes.get(identifier)

        return await new Promise(resolve => {

            if(route[0].toLowerCase() == WETH.toLowerCase()){
                console.log("swapExactETHForToken")
                _this.proxy.methods.swapExactETHForToken(route, fees).estimateGas({value: amount, from: baseWallet.getCurrentAddress()}).then(gas => {
                    gas += this.additionalGas
                    _this.proxy.methods.swapExactETHForToken(route, fees).send({value: amount, nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {
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

            const swapExactTokenForETH = function(approveHash, gas){
                _this.proxy.methods.swapExactTokenForETH(amount, route, fees).send({nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {
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
                _this.proxy.methods.swapExactTokenForToken(amount, route, fees).send({nonce: nonce, gasPrice: gasPrice, from: baseWallet.getCurrentAddress(), gas: gas}).on("transactionHash", hash => {
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
                    _this.proxy.methods.swapExactTokenForETH(amount, route, fees).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                        swapExactTokenForETH(approveHash, gas + _this.additionalGas)
                    })
                    return
                }
                _this.proxy.methods.swapExactTokenForToken(amount, route, fees).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                    swapExactTokenForToken(approveHash, gas + _this.additionalGas)
                })
            }

            const swap = function (approveHash){
                if(route[route.length-1].toLowerCase() == WETH.toLowerCase()){
                    swapExactTokenForETH(approveHash, _this.defaultSwapGas)
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

    static encodePath(path, fees) {
        const FEE_SIZE = 6
        if (path.length !== fees.length + 1) {
            throw new Error('path/fee lengths do not match')
        }

        let encoded = '0x'
        for (let i = 0; i < fees.length; i++) {
            encoded += path[i].slice(2)
            let fee = web3.utils.toHex(parseFloat(fees[i])).slice(2).toString();
            encoded += fee.padStart(FEE_SIZE, '0');
        }
        encoded += path[path.length - 1].slice(2)
        return encoded
    }

}
