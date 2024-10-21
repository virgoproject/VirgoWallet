class Uniswap03Utils {

    static defaultSwapGas = 600000n
    static additionalGas = 50000n
    static baseSwapFee = 0.01

    constructor(chain) {
        this.chain = chain
        this.web3 = baseWallet.getWeb3ByID(chain.chainID)
    }

    async estimateSwapFees(dexParams, amount, quote){
        if(quote.routes[0].route.length == 2)
            return await this.estimateSwapFees_single(dexParams, amount, quote)

        return await this.estimateSwapFees_multi(dexParams, amount, quote)
    }

    async estimateSwapFees_single(dexParams, amount, quote){

        const initialRoute = quote.routes[0]

        const route = {}
        route.fees = initialRoute.fees
        route.route = []

        for(const node of initialRoute.route){
            if(node == this.chain.ticker){
                route.route.push(dexParams.params.WETH)
                continue
            }

            route.route.push(node)
        }

        const proxy = new this.web3.eth.Contract(VIRGOSWAP_ABI, dexParams.params.proxyAddress, { from: baseWallet.getCurrentAddress()});

        const minOut = BigInt(quote.routes[0].amount) * BigInt(quote.taxA) / 1000n * BigInt(quote.taxB) / 1000n

        let cumuledFees = Uniswap03Utils.baseSwapFee
        for(let fee of route.fees){
            console.log(fee)
            cumuledFees+=(fee/1000000)
        }

        console.log("got here")

        if(initialRoute.route[0] == this.chain.ticker){
            console.log("laaaa")
            console.log(dexParams.params.proxyAddress)
            return {
                gas: (await proxy.methods.univ3_swapExactETHForTokensSingle(dexParams.params.routerAddress, route.route, route.fees[0], minOut).estimateGas({from: baseWallet.getCurrentAddress(), value: amount}) + Uniswap03Utils.additionalGas).toString(),
                feesRate: cumuledFees
            }
        }

        const token = new this.web3.eth.Contract(ERC20_ABI, route.route[0], { from: baseWallet.getCurrentAddress()});

        const allowance = await token.methods.allowance(baseWallet.getCurrentAddress(), dexParams.params.proxyAddress).call()

        console.log("got hereqq")

        if(allowance < BigInt(amount)){
            return {
                gas: (Uniswap03Utils.defaultSwapGas + await token.methods.approve(dexParams.params.proxyAddress, 115792089237316195423570985008687907853269984665640564039457584007913129639935n).estimateGas()).toString(),
                feesRate: cumuledFees
            }
        }

        console.log("got heresds")

        if(initialRoute.route[initialRoute.route.length-1] == this.chain.ticker)
            return {
                gas: (await proxy.methods.univ3_swapExactTokensForETHSingle(dexParams.params.routerAddress, amount, route.route, route.fees[0], minOut).estimateGas({ from: baseWallet.getCurrentAddress()}) + Uniswap03Utils.additionalGas).toString(),
                feesRate: cumuledFees
            }

        console.log("gotq here")

        return {
            gas: (await proxy.methods.univ3_swapExactTokensForTokensSingle(dexParams.params.routerAddress, amount, route.route, route.fees[0], minOut).estimateGas({ from: baseWallet.getCurrentAddress()}) + Uniswap03Utils.additionalGas).toString(),
            feesRate: cumuledFees
        }
    }

    async estimateSwapFees_multi(dexParams, amount, quote){

        const initialRoute = quote.routes[0]

        const route = {}
        route.fees = initialRoute.fees
        route.route = []

        for(const node of initialRoute.route){
            if(node == this.chain.ticker){
                route.route.push(dexParams.params.WETH)
                continue
            }

            route.route.push(node)
        }
        const proxy = new this.web3.eth.Contract(VIRGOSWAP_ABI, dexParams.params.proxyAddress, { from: baseWallet.getCurrentAddress()});

        const minOut = BigInt(quote.routes[0].amount) * BigInt(quote.taxA) / 1000n  * BigInt(quote.taxB) / 1000n

        const path = this.encodePath(route.route, route.fees)

        let cumuledFees = Uniswap03Utils.baseSwapFee
        for(let fee of route.fees){
            cumuledFees+=(fee/1000000)
        }

        if(initialRoute.route[0] == this.chain.ticker)
            return {
                gas: (await proxy.methods.univ3_swapExactETHForTokens(dexParams.params.routerAddress, path, minOut).estimateGas({from: baseWallet.getCurrentAddress(), value: amount}) + Uniswap03Utils.additionalGas).toString(),
                feesRate: cumuledFees
            }

        const token = new this.web3.eth.Contract(ERC20_ABI, route.route[0], { from: baseWallet.getCurrentAddress()});

        const allowance = await token.methods.allowance(baseWallet.getCurrentAddress(), dexParams.params.proxyAddress).call()

        if(allowance < BigInt(amount)){
            return {
                gas: (Uniswap03Utils.defaultSwapGas + await token.methods.approve(dexParams.params.proxyAddress, 115792089237316195423570985008687907853269984665640564039457584007913129639935n).estimateGas()).toString(),
                feesRate: cumuledFees
            }
        }

        if(initialRoute.route[initialRoute.route.length-1] == this.chain.ticker)
            return {
                gas: (await proxy.methods.univ3_swapExactTokensForETH(dexParams.params.routerAddress, amount, route.route[0], path, minOut).estimateGas({ from: baseWallet.getCurrentAddress()}) + Uniswap03Utils.additionalGas).toString(),
                feesRate: cumuledFees
            }

        return {
            gas: (await proxy.methods.univ3_swapExactTokensForTokens(dexParams.params.routerAddress, amount, route.route[0], path, minOut).estimateGas({ from: baseWallet.getCurrentAddress()}) + Uniswap03Utils.additionalGas).toString(),
            feesRate: cumuledFees
        }
    }

    async initSwap(dexParams, amount, quote, gasPrice){

        if(quote.routes[0].route.length == 2)
            return await this.initSwap_single(dexParams, amount, quote, gasPrice)

        return await this.initSwap_multi(dexParams, amount, quote, gasPrice)

    }

    async initSwap_single(dexParams, amount, quote, gasPrice){
        const _this = this

        let nonce = await this.web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending")

        const initialRoute = quote.routes[0]

        const route = {}
        route.fees = initialRoute.fees
        route.route = []

        for(const node of initialRoute.route){
            if(node == this.chain.ticker){
                route.route.push(dexParams.params.WETH)
                continue
            }

            route.route.push(node)
        }

        const proxy = new this.web3.eth.Contract(VIRGOSWAP_ABI, dexParams.params.proxyAddress, { from: baseWallet.getCurrentAddress()});

        const minOut = BigInt(quote.routes[0].amount) * BigInt(quote.taxA) / 1000n * BigInt(quote.taxB) / 1000n

        return await new Promise(resolve => {

            if(initialRoute.route[0] == _this.chain.ticker){
                console.log("swapExactETHForToken")
                proxy.methods.univ3_swapExactETHForTokensSingle(dexParams.params.routerAddress, route.route, route.fees[0], minOut).estimateGas({value: amount, from: baseWallet.getCurrentAddress()}).then(gas => {
                    gas += Uniswap03Utils.additionalGas
                    proxy.methods.univ3_swapExactETHForTokensSingle(dexParams.params.routerAddress, route.route, route.fees[0], minOut).send({value: amount, nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {

                        try{
                            fetch(`https://airdrops.virgo.net:2083/api/reward/swap/register/${_this.chain.chainID}/${hash}`)
                        }catch (e) {}

                        _this.chain.transactions.unshift({
                            "hash": hash,
                            "contractAddr": "SWAP",
                            "date": Date.now(),
                            "recipient": dexParams.params.proxyAddress,
                            "amount": 0,
                            "gasPrice": gasPrice.toString(),
                            "gasLimit": gas.toString(),
                            "nonce": nonce,
                            "origin": "Virgo Swap",
                            "swapInfos": {
                                "route": route.route,
                                "tokenIn": route.route[0],
                                "tokenOut": route.route[route.route.length-1],
                                "amountIn": amount,
                                "approveHash": ""
                            }
                        })
                        baseWallet.save()
                        resolve(true)
                    })
                })
                return
            }

            const token = new _this.web3.eth.Contract(ERC20_ABI, route.route[0], { from: baseWallet.getCurrentAddress()});

            const swapExactTokenForETH = function(approveHash, gas){
                proxy.methods.univ3_swapExactTokensForETHSingle(dexParams.params.routerAddress, amount, route.route, route.fees[0], minOut).send({nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {

                    try{
                        fetch(`https://airdrops.virgo.net:2083/api/reward/swap/register/${_this.chain.chainID}/${hash}`)
                    }catch (e) {}

                    _this.chain.transactions.unshift({
                        "hash": hash,
                        "contractAddr": "SWAP",
                        "date": Date.now(),
                        "recipient": dexParams.params.proxyAddress,
                        "amount": 0,
                        "gasPrice": gasPrice.toString(),
                        "gasLimit": gas.toString(),
                        "nonce": nonce,
                        "origin": "Virgo Swap",
                        "swapInfos": {
                            "route": route.route,
                            "tokenIn": route.route[0],
                            "tokenOut": route.route[route.route.length-1],
                            "amountIn": amount,
                            "approveHash": approveHash
                        }
                    })
                    baseWallet.save()
                    resolve(true)
                })
            }

            const swapExactTokenForToken = function(approveHash, gas){
                proxy.methods.univ3_swapExactTokensForTokensSingle(dexParams.params.routerAddress, amount, route.route, route.fees[0], minOut).send({nonce: nonce, gasPrice: gasPrice, from: baseWallet.getCurrentAddress(), gas: gas}).on("transactionHash", hash => {

                    try{
                        fetch(`https://airdrops.virgo.net:2083/api/reward/swap/register/${_this.chain.chainID}/${hash}`)
                    }catch (e) {}

                    _this.chain.transactions.unshift({
                        "hash": hash,
                        "contractAddr": "SWAP",
                        "date": Date.now(),
                        "recipient": dexParams.params.proxyAddress,
                        "amount": 0,
                        "gasPrice": gasPrice.toString(),
                        "gasLimit": gas.toString(),
                        "nonce": nonce,
                        "origin": "Virgo Swap",
                        "swapInfos": {
                            "route": route.route,
                            "tokenIn": route.route[0],
                            "tokenOut": route.route[route.route.length-1],
                            "amountIn": amount,
                            "approveHash": approveHash
                        }
                    })
                    baseWallet.save()
                    resolve(true)
                })
            }

            const estimateGas = function (approveHash){
                if(initialRoute.route[initialRoute.route.length-1] == _this.chain.ticker){
                    proxy.methods.univ3_swapExactTokensForETHSingle(dexParams.params.routerAddress, amount, route.route, route.fees[0], minOut).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                        swapExactTokenForETH(approveHash, gas + Uniswap03Utils.additionalGas)
                    })
                    return
                }
                proxy.methods.univ3_swapExactTokensForTokensSingle(dexParams.params.routerAddress, amount, route.route, route.fees[0], minOut).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                    swapExactTokenForToken(approveHash, gas + Uniswap03Utils.additionalGas)
                })
            }

            const swap = function (approveHash){
                if(initialRoute.route[initialRoute.route.length-1] == _this.chain.ticker){
                    swapExactTokenForETH(approveHash, Uniswap03Utils.defaultSwapGas)
                    return
                }
                swapExactTokenForToken(approveHash, Uniswap03Utils.defaultSwapGas)
            }

            token.methods.allowance(baseWallet.getCurrentAddress(), dexParams.params.proxyAddress).call().then(allowance => {
                if(allowance < BigInt(amount)){
                    token.methods.approve(dexParams.params.proxyAddress, 115792089237316195423570985008687907853269984665640564039457584007913129639935n).estimateGas().then(gas => {
                        token.methods.approve(dexParams.params.proxyAddress, 115792089237316195423570985008687907853269984665640564039457584007913129639935n).send({nonce: nonce, gasPrice: gasPrice, gas: gas}).on("transactionHash", hash => {
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

    async initSwap_multi(dexParams, amount, quote, gasPrice){
        const _this = this

        let nonce = await this.web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending")

        const initialRoute = quote.routes[0]

        const route = {}
        route.fees = initialRoute.fees
        route.route = []

        for(const node of initialRoute.route){
            if(node == this.chain.ticker){
                route.route.push(dexParams.params.WETH)
                continue
            }

            route.route.push(node)
        }

        const path = this.encodePath(route.route, route.fees)

        const proxy = new this.web3.eth.Contract(VIRGOSWAP_ABI, dexParams.params.proxyAddress, { from: baseWallet.getCurrentAddress()});

        const minOut = BigInt(quote.routes[0].amount) * BigInt(quote.taxA) / 1000n * BigInt(quote.taxB) / 1000n

        return await new Promise(resolve => {

            if(initialRoute.route[0] == _this.chain.ticker){
                console.log("swapExactETHForToken")
                proxy.methods.univ3_swapExactETHForTokens(dexParams.params.routerAddress, path, minOut).estimateGas({value: amount, from: baseWallet.getCurrentAddress()}).then(gas => {
                    gas += Uniswap03Utils.additionalGas
                    proxy.methods.univ3_swapExactETHForTokens(dexParams.params.routerAddress, path, minOut).send({value: amount, nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {

                        try{
                            fetch(`https://airdrops.virgo.net:2083/api/reward/swap/register/${_this.chain.chainID}/${hash}`)
                        }catch (e) {}

                        _this.chain.transactions.unshift({
                            "hash": hash,
                            "contractAddr": "SWAP",
                            "date": Date.now(),
                            "recipient": dexParams.params.proxyAddress,
                            "amount": 0,
                            "gasPrice": gasPrice.toString(),
                            "gasLimit": gas.toString(),
                            "nonce": nonce,
                            "origin": "Virgo Swap",
                            "swapInfos": {
                                "route": route.route,
                                "tokenIn": route.route[0],
                                "tokenOut": route.route[route.route.length-1],
                                "amountIn": amount,
                                "approveHash": ""
                            }
                        })
                        baseWallet.save()
                        resolve(true)
                    })
                })
                return
            }

            const token = new _this.web3.eth.Contract(ERC20_ABI, route.route[0], { from: baseWallet.getCurrentAddress()});

            const swapExactTokenForETH = function(approveHash, gas){
                proxy.methods.univ3_swapExactTokensForETH(dexParams.params.routerAddress, amount, route.route[0], path, minOut).send({nonce: nonce, gasPrice: gasPrice, gas: gas, from: baseWallet.getCurrentAddress()}).on("transactionHash", hash => {

                    try{
                        fetch(`https://airdrops.virgo.net:2083/api/reward/swap/register/${_this.chain.chainID}/${hash}`)
                    }catch (e) {}

                    _this.chain.transactions.unshift({
                        "hash": hash,
                        "contractAddr": "SWAP",
                        "date": Date.now(),
                        "recipient": dexParams.params.proxyAddress,
                        "amount": 0,
                        "gasPrice": gasPrice.toString(),
                        "gasLimit": gas.toString(),
                        "nonce": nonce,
                        "origin": "Virgo Swap",
                        "swapInfos": {
                            "route": route.route,
                            "tokenIn": route.route[0],
                            "tokenOut": route.route[route.route.length-1],
                            "amountIn": amount,
                            "approveHash": approveHash
                        }
                    })
                    baseWallet.save()
                    resolve(true)
                })
            }

            const swapExactTokenForToken = function(approveHash, gas){
                proxy.methods.univ3_swapExactTokensForTokens(dexParams.params.routerAddress, amount, route.route[0], path, minOut).send({nonce: nonce, gasPrice: gasPrice, from: baseWallet.getCurrentAddress(), gas: gas}).on("transactionHash", hash => {

                    try{
                        fetch(`https://airdrops.virgo.net:2083/api/reward/swap/register/${_this.chain.chainID}/${hash}`)
                    }catch (e) {}

                    _this.chain.transactions.unshift({
                        "hash": hash,
                        "contractAddr": "SWAP",
                        "date": Date.now(),
                        "recipient": dexParams.params.proxyAddress,
                        "amount": 0,
                        "gasPrice": gasPrice.toString(),
                        "gasLimit": gas.toString(),
                        "nonce": nonce,
                        "origin": "Virgo Swap",
                        "swapInfos": {
                            "route": route.route,
                            "tokenIn": route.route[0],
                            "tokenOut": route.route[route.route.length-1],
                            "amountIn": amount,
                            "approveHash": approveHash
                        }
                    })
                    baseWallet.save()
                    resolve(true)
                })
            }

            const estimateGas = function (approveHash){
                if(initialRoute.route[initialRoute.route.length-1] == _this.chain.ticker){
                    proxy.methods.univ3_swapExactTokensForETH(dexParams.params.routerAddress, amount, route.route[0], path, minOut).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                        swapExactTokenForETH(approveHash, gas + Uniswap03Utils.additionalGas)
                    })
                    return
                }
                proxy.methods.univ3_swapExactTokensForTokens(dexParams.params.routerAddress, amount, route.route[0], path, minOut).estimateGas({from: baseWallet.getCurrentAddress()}).then(gas => {
                    swapExactTokenForToken(approveHash, gas + Uniswap03Utils.additionalGas)
                })
            }

            const swap = function (approveHash){
                if(initialRoute.route[initialRoute.route.length-1] == _this.chain.ticker){
                    swapExactTokenForETH(approveHash, Uniswap03Utils.defaultSwapGas)
                    return
                }
                swapExactTokenForToken(approveHash, Uniswap03Utils.defaultSwapGas)
            }

            token.methods.allowance(baseWallet.getCurrentAddress(), dexParams.params.proxyAddress).call().then(allowance => {
                if(allowance < BigInt(amount)){
                    token.methods.approve(dexParams.params.proxyAddress, 115792089237316195423570985008687907853269984665640564039457584007913129639935n).estimateGas().then(gas => {
                        token.methods.approve(dexParams.params.proxyAddress, 115792089237316195423570985008687907853269984665640564039457584007913129639935n).send({nonce: nonce, gasPrice: gasPrice, gas: gas}).on("transactionHash", hash => {
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

    encodePath(path, fees) {
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
