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

        const initialRoute = quote.routes[0]

        const route = {}
        route.fees = initialRoute.fees
        route.route = []

        for(const node of initialRoute.route){
            if(node == baseWallet.getCurrentWallet().ticker){
                route.route.push(dexParams.params.WETH)
                continue
            }

            route.route.push(node)
        }

        const proxy = new web3.eth.Contract(VIRGOSWAP_ABI, dexParams.params.proxyAddress, { from: baseWallet.getCurrentAddress()});

        const minOut = new BN(quote.routes[0].amount).mul(new BN(quote.taxA)).div(new BN("1000")).mul(new BN(quote.taxB)).div(new BN("1000"))

        let cumuledFees = this.baseSwapFee
        for(let fee of route.fees){
            console.log(fee)
            cumuledFees+=(fee/1000000)
        }

        if(initialRoute.route[0] == baseWallet.getCurrentWallet().ticker)
            return {
                gas: await proxy.methods.univ3_swapExactETHForTokensSingle(dexParams.params.routerAddress, route.route, route.fees[0], minOut).estimateGas({from: baseWallet.getCurrentAddress(), value: amount}) + this.additionalGas,
                feesRate: cumuledFees
            }

        const token = new web3.eth.Contract(ERC20_ABI, route.route[0], { from: baseWallet.getCurrentAddress()});

        const allowance = await token.methods.allowance(baseWallet.getCurrentAddress(), dexParams.params.proxyAddress).call()

        console.log(allowance)

        if(new BN(allowance).lt(amount)){
            return {
                gas: this.defaultSwapGas + await token.methods.approve(dexParams.params.proxyAddress, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).estimateGas(),
                feesRate: cumuledFees
            }
        }

        if(initialRoute.route[initialRoute.route.length-1] == baseWallet.getCurrentWallet().ticker)
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

        const initialRoute = quote.routes[0]

        const route = {}
        route.fees = initialRoute.fees
        route.route = []

        for(const node of initialRoute.route){
            if(node == baseWallet.getCurrentWallet().ticker){
                route.route.push(dexParams.params.WETH)
                continue
            }

            route.route.push(node)
        }
        const proxy = new web3.eth.Contract(VIRGOSWAP_ABI, dexParams.params.proxyAddress, { from: baseWallet.getCurrentAddress()});

        const minOut = new BN(quote.routes[0].amount).mul(new BN(quote.taxA)).div(new BN("1000")).mul(new BN(quote.taxB)).div(new BN("1000"))

        const path = this.encodePath(route.route, route.fees)

        let cumuledFees = this.baseSwapFee
        for(let fee of route.fees){
            console.log(fee)
            cumuledFees+=(fee/1000000)
        }

        if(initialRoute.route[0] == baseWallet.getCurrentWallet().ticker)
            return {
                gas: await proxy.methods.univ3_swapExactETHForTokens(dexParams.params.routerAddress, path, minOut).estimateGas({from: baseWallet.getCurrentAddress(), value: amount}) + this.additionalGas,
                feesRate: cumuledFees
            }

        const token = new web3.eth.Contract(ERC20_ABI, route.route[0], { from: baseWallet.getCurrentAddress()});

        const allowance = await token.methods.allowance(baseWallet.getCurrentAddress(), dexParams.params.proxyAddress).call()

        if(new BN(allowance).lt(amount)){
            return {
                gas: this.defaultSwapGas + await token.methods.approve(dexParams.params.proxyAddress, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).estimateGas(),
                feesRate: cumuledFees
            }
        }

        if(initialRoute.route[initialRoute.route.length-1] == baseWallet.getCurrentWallet().ticker)
            return {
                gas: await proxy.methods.univ3_swapExactTokensForETH(dexParams.params.routerAddress, amount, route.route[0], path, minOut).estimateGas({ from: baseWallet.getCurrentAddress()}) + this.additionalGas,
                feesRate: cumuledFees
            }

        return {
            gas: await proxy.methods.univ3_swapExactTokensForTokens(dexParams.params.routerAddress, amount, route.route[0], path, minOut).estimateGas({ from: baseWallet.getCurrentAddress()}) + this.additionalGas,
            feesRate: cumuledFees
        }
    }

    static async initSwap(dexParams, amount, quote, gasPrice){

        if(quote.routes[0].route.length == 2)
            return await this.initSwap_single(dexParams, amount, quote, gasPrice)

        return await this.initSwap_multi(dexParams, amount, quote, gasPrice)

    }

    static async initSwap_single(dexParams, amount, quote, gasPrice){
        const _this = this

        let nonce = await web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending")

        const initialRoute = quote.routes[0]

        const route = {}
        route.fees = initialRoute.fees
        route.route = []

        for(const node of initialRoute.route){
            if(node == baseWallet.getCurrentWallet().ticker){
                route.route.push(dexParams.params.WETH)
                continue
            }

            route.route.push(node)
        }

        const proxy = new web3.eth.Contract(VIRGOSWAP_ABI, dexParams.params.proxyAddress, { from: baseWallet.getCurrentAddress()});

        const minOut = new BN(quote.routes[0].amount).mul(new BN(quote.taxA)).div(new BN("1000")).mul(new BN(quote.taxB)).div(new BN("1000"))

        return await new Promise(resolve => {

            if(initialRoute.route[0] == baseWallet.getCurrentWallet().ticker){
                console.log("swapExactETHForToken")
                proxy.methods.univ3_swapExactETHForTokensSingle(dexParams.params.routerAddress, route.route, route.fees[0], minOut).estimateGas({value: amount, from: baseWallet.getCurrentAddress()}).then(gas => {
                    gas += this.additionalGas
                    proxy.methods.univ3_swapExactETHForTokensSingle(dexParams.params.routerAddress, route.route, route.fees[0], minOut).send({value: amount, nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {
                        baseWallet.getCurrentWallet().transactions.unshift({
                            "hash": hash,
                            "contractAddr": "SWAP",
                            "date": Date.now(),
                            "recipient": dexParams.params.proxyAddress,
                            "amount": 0,
                            "gasPrice": gasPrice,
                            "gasLimit": gas,
                            "nonce": nonce,
                            "origin": "Virgo Swap",
                            "swapInfos": {
                                "route": route.route,
                                "tokenIn": route[0],
                                "tokenOut": route[route.length-1],
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

            const token = new web3.eth.Contract(ERC20_ABI, route.route[0], { from: baseWallet.getCurrentAddress()});

            const swapExactTokenForETH = function(approveHash, gas){
                proxy.methods.univ3_swapExactTokensForETHSingle(dexParams.params.routerAddress, amount, route.route, route.fees[0], minOut).send({nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {
                    baseWallet.getCurrentWallet().transactions.unshift({
                        "hash": hash,
                        "contractAddr": "SWAP",
                        "date": Date.now(),
                        "recipient": dexParams.params.proxyAddress,
                        "amount": 0,
                        "gasPrice": gasPrice,
                        "gasLimit": gas,
                        "nonce": nonce,
                        "origin": "Virgo Swap",
                        "swapInfos": {
                            "route": route.route,
                            "tokenIn": route[0],
                            "tokenOut": route[route.length-1],
                            "amountIn": amount.toString(),
                            "approveHash": approveHash
                        }
                    })
                    baseWallet.save()
                    resolve(true)
                })
            }

            const swapExactTokenForToken = function(approveHash, gas){
                proxy.methods.univ3_swapExactTokensForTokensSingle(dexParams.params.routerAddress, amount, route.route, route.fees[0], minOut).send({nonce: nonce, gasPrice: gasPrice, from: baseWallet.getCurrentAddress(), gas: gas}).on("transactionHash", hash => {
                    baseWallet.getCurrentWallet().transactions.unshift({
                        "hash": hash,
                        "contractAddr": "SWAP",
                        "date": Date.now(),
                        "recipient": dexParams.params.proxyAddress,
                        "amount": 0,
                        "gasPrice": gasPrice,
                        "gasLimit": gas,
                        "nonce": nonce,
                        "origin": "Virgo Swap",
                        "swapInfos": {
                            "route": route.route,
                            "tokenIn": route[0],
                            "tokenOut": route[route.length-1],
                            "amountIn": amount.toString(),
                            "approveHash": approveHash
                        }
                    })
                    baseWallet.save()
                    resolve(true)
                })
            }

            const estimateGas = function (approveHash){
                if(initialRoute.route[initialRoute.route.length-1] == baseWallet.getCurrentWallet().ticker){
                    proxy.methods.univ3_swapExactTokensForETHSingle(dexParams.params.routerAddress, amount, route.route, route.fees[0], minOut).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                        swapExactTokenForETH(approveHash, gas + _this.additionalGas)
                    })
                    return
                }
                proxy.methods.univ3_swapExactTokensForTokensSingle(dexParams.params.routerAddress, amount, route.route, route.fees[0], minOut).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                    swapExactTokenForToken(approveHash, gas + _this.additionalGas)
                })
            }

            const swap = function (approveHash){
                if(initialRoute.route[initialRoute.route.length-1] == baseWallet.getCurrentWallet().ticker){
                    swapExactTokenForETH(approveHash, _this.defaultSwapGas)
                    return
                }
                swapExactTokenForToken(approveHash, _this.defaultSwapGas)
            }

            token.methods.allowance(baseWallet.getCurrentAddress(), dexParams.params.proxyAddress).call().then(allowance => {
                if(new BN(allowance).lt(amount)){
                    token.methods.approve(dexParams.params.proxyAddress, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).estimateGas().then(gas => {
                        token.methods.approve(dexParams.params.proxyAddress, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).send({nonce: nonce, gasPrice: gasPrice, gas: gas}).on("transactionHash", hash => {
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

    static async initSwap_multi(dexParams, amount, quote, gasPrice){
        const _this = this

        let nonce = await web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending")

        const initialRoute = quote.routes[0]

        const route = {}
        route.fees = initialRoute.fees
        route.route = []

        for(const node of initialRoute.route){
            if(node == baseWallet.getCurrentWallet().ticker){
                route.route.push(dexParams.params.WETH)
                continue
            }

            route.route.push(node)
        }

        const path = this.encodePath(route.route, route.fees)

        const proxy = new web3.eth.Contract(VIRGOSWAP_ABI, dexParams.params.proxyAddress, { from: baseWallet.getCurrentAddress()});

        const minOut = new BN(quote.routes[0].amount).mul(new BN(quote.taxA)).div(new BN("1000")).mul(new BN(quote.taxB)).div(new BN("1000"))

        return await new Promise(resolve => {

            if(initialRoute.route[0] == baseWallet.getCurrentWallet().ticker){
                console.log("swapExactETHForToken")
                proxy.methods.univ3_swapExactETHForTokens(dexParams.params.routerAddress, path, minOut).estimateGas({value: amount, from: baseWallet.getCurrentAddress()}).then(gas => {
                    gas += this.additionalGas
                    proxy.methods.univ3_swapExactETHForTokens(dexParams.params.routerAddress, path, minOut).send({value: amount, nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {
                        baseWallet.getCurrentWallet().transactions.unshift({
                            "hash": hash,
                            "contractAddr": "SWAP",
                            "date": Date.now(),
                            "recipient": dexParams.params.proxyAddress,
                            "amount": 0,
                            "gasPrice": gasPrice,
                            "gasLimit": gas,
                            "nonce": nonce,
                            "origin": "Virgo Swap",
                            "swapInfos": {
                                "route": route.route,
                                "tokenIn": route[0],
                                "tokenOut": route[route.length-1],
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

            const token = new web3.eth.Contract(ERC20_ABI, route.route[0], { from: baseWallet.getCurrentAddress()});

            const swapExactTokenForETH = function(approveHash, gas){
                proxy.methods.univ3_swapExactTokensForETH(dexParams.params.routerAddress, amount, route.route[0], path, minOut).send({nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {
                    baseWallet.getCurrentWallet().transactions.unshift({
                        "hash": hash,
                        "contractAddr": "SWAP",
                        "date": Date.now(),
                        "recipient": dexParams.params.proxyAddress,
                        "amount": 0,
                        "gasPrice": gasPrice,
                        "gasLimit": gas,
                        "nonce": nonce,
                        "origin": "Virgo Swap",
                        "swapInfos": {
                            "route": route.route,
                            "tokenIn": route[0],
                            "tokenOut": route[route.length-1],
                            "amountIn": amount.toString(),
                            "approveHash": approveHash
                        }
                    })
                    baseWallet.save()
                    resolve(true)
                })
            }

            const swapExactTokenForToken = function(approveHash, gas){
                proxy.methods.univ3_swapExactTokensForTokens(dexParams.params.routerAddress, amount, route.route[0], path, minOut).send({nonce: nonce, gasPrice: gasPrice, from: baseWallet.getCurrentAddress(), gas: gas}).on("transactionHash", hash => {
                    baseWallet.getCurrentWallet().transactions.unshift({
                        "hash": hash,
                        "contractAddr": "SWAP",
                        "date": Date.now(),
                        "recipient": dexParams.params.proxyAddress,
                        "amount": 0,
                        "gasPrice": gasPrice,
                        "gasLimit": gas,
                        "nonce": nonce,
                        "origin": "Virgo Swap",
                        "swapInfos": {
                            "route": route.route,
                            "tokenIn": route[0],
                            "tokenOut": route[route.length-1],
                            "amountIn": amount.toString(),
                            "approveHash": approveHash
                        }
                    })
                    baseWallet.save()
                    resolve(true)
                })
            }

            const estimateGas = function (approveHash){
                if(initialRoute.route[initialRoute.route.length-1] == baseWallet.getCurrentWallet().ticker){
                    proxy.methods.univ3_swapExactTokensForETH(dexParams.params.routerAddress, amount, route.route[0], path, minOut).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                        swapExactTokenForETH(approveHash, gas + _this.additionalGas)
                    })
                    return
                }
                proxy.methods.univ3_swapExactTokensForTokens(dexParams.params.routerAddress, amount, route.route[0], path, minOut).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                    swapExactTokenForToken(approveHash, gas + _this.additionalGas)
                })
            }

            const swap = function (approveHash){
                if(initialRoute.route[initialRoute.route.length-1] == baseWallet.getCurrentWallet().ticker){
                    swapExactTokenForETH(approveHash, _this.defaultSwapGas)
                    return
                }
                swapExactTokenForToken(approveHash, _this.defaultSwapGas)
            }

            token.methods.allowance(baseWallet.getCurrentAddress(), dexParams.params.proxyAddress).call().then(allowance => {
                if(new BN(allowance).lt(amount)){
                    token.methods.approve(dexParams.params.proxyAddress, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).estimateGas().then(gas => {
                        token.methods.approve(dexParams.params.proxyAddress, new BN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).send({nonce: nonce, gasPrice: gasPrice, gas: gas}).on("transactionHash", hash => {
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
