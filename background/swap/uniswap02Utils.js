class Uniswap02Utils {

    constructor(proxyAddress, routerAddress, factoryAddress, tokens, feesRate, WETH) {
        this.proxyAddress = proxyAddress
        this.routerAddress = routerAddress
        this.factoryAddress = factoryAddress
        this.feesRate = feesRate
        this.WETH = WETH

        this.router = new web3.eth.Contract(UNI_ROUTER02, routerAddress)
        this.factory = new web3.eth.Contract(UNI_FACTORY, factoryAddress)
        this.proxy = new web3.eth.Contract(VIRGOSWAP, proxyAddress)

        this.tokens = tokens

        this.defaultSwapGas = 600000
        this.additionalGas = 50000
        this.baseSwapFee = 0.01
    }

    async findRoute(amount, tokenA, tokenB) {

        const WETH = await this.getWETH()

        let routes = [];
        let maxRoutes = 2 + this.tokens.length * 3

        const _this = this

        return await new Promise(async function(resolve){

            const checkFinished = function (){//1

                if(routes.length < maxRoutes)
                    return

                routes.sort(function(a, b){
                    if(a.amount.eq(b.amount)) return 0
                    if(a.amount.lt(b.amount)) return 1
                    return -1
                })

                if(routes.length == 0)
                    return false

                resolve(routes[0])
            }

            let A_WETH;
            let B_WETH;

            //check if has direct pair and add it
            if(tokenA.toLowerCase() != WETH.toLowerCase() && tokenB.toLowerCase() != WETH.toLowerCase()){
                _this.factory.methods.getPair(tokenA, tokenB).call().then(async function(res){
                    if(res != "0x0000000000000000000000000000000000000000"){
                        routes.push({
                            route: [tokenA, tokenB],
                            amount: await _this.getAmountOut(amount, [tokenA, tokenB])
                        })
                        checkFinished()
                    } else {
                        maxRoutes--;
                        checkFinished()
                    }
                })
                A_WETH = await _this.factory.methods.getPair(tokenA, WETH).call() != "0x0000000000000000000000000000000000000000"
                B_WETH = await _this.factory.methods.getPair(tokenB, WETH).call() != "0x0000000000000000000000000000000000000000"
            }else{
                const res = await _this.factory.methods.getPair(tokenA, tokenB).call() != "0x0000000000000000000000000000000000000000"
                if(tokenA.toLowerCase() == WETH.toLowerCase()){
                    A_WETH = false
                    B_WETH = res
                }else{
                    A_WETH = res
                    B_WETH = false
                }
                if(res){
                    _this.getAmountOut(amount, [tokenA, tokenB]).then(amountOut => {
                        routes.push({
                            route: [tokenA, tokenB],
                            amount: amountOut
                        })
                        checkFinished()
                    })
                } else {
                    maxRoutes--;
                    checkFinished()
                }
            }

            if(A_WETH && B_WETH){
                _this.getAmountOut(amount, [tokenA, WETH, tokenB]).then(amountOut => {
                    routes.push({
                        route: [tokenA, WETH, tokenB],
                        amount: amountOut
                    })
                    checkFinished()
                })
            } else {
                maxRoutes--;
                checkFinished()
            }

            for(const token of _this.tokens){
                if(tokenA.toLowerCase() == token.toLowerCase() || tokenB.toLowerCase() == token.toLowerCase()) {
                    maxRoutes -= 3
                    checkFinished()
                    continue
                }

                _this.factory.methods.getPair(tokenA, token).call().then(A_token => {
                    A_token = A_token != "0x0000000000000000000000000000000000000000"
                    _this.factory.methods.getPair(tokenB, token).call().then(B_token => {
                        B_token = B_token != "0x0000000000000000000000000000000000000000"

                        if(A_token && B_token) {
                            _this.getAmountOut(amount, [tokenA, token, tokenB]).then(pairAmount => {
                                routes.push({
                                    route: [tokenA, token, tokenB],
                                    amount: pairAmount
                                })
                                checkFinished()
                            })
                        } else {
                            maxRoutes--;
                            checkFinished()
                        }

                        if(((A_token && B_token && A_WETH) || (!A_token && B_token && A_WETH)) && tokenB.toLowerCase() != WETH.toLowerCase()){
                            _this.getAmountOut(amount, [tokenA, WETH, token, tokenB]).then(pairAmount => {
                                routes.push({
                                    route: [tokenA, WETH, token, tokenB],
                                    amount: pairAmount
                                })
                                checkFinished()
                            })
                        } else {
                            maxRoutes--;
                            checkFinished()
                        }

                        if(((A_token && B_token && B_WETH) || (A_token && !B_token && B_WETH)) && tokenA.toLowerCase() != WETH.toLowerCase()){
                            _this.getAmountOut(amount, [tokenA, token, WETH, tokenB]).then(pairAmount => {
                                routes.push({
                                    route: [tokenA, token, WETH, tokenB],
                                    amount: pairAmount
                                })
                                checkFinished()
                            })
                        } else {
                            maxRoutes--;
                            checkFinished()
                        }

                    })
                })

            }

        })

    }

    async getAmountOut(amount, route){
        const amountOut = await this.router.methods.getAmountsOut(amount, route).call()
        return web3.utils.toBN(amountOut[amountOut.length-1])
    }

    async estimateSwapFees(amount, route){
        const WETH = await this.getWETH()

        console.log(route)
        console.log(amount.toString())

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

            const swapExactETHForToken = function(){
                _this.proxy.methods.swapExactBNBForToken(route).estimateGas({value: amount, from: baseWallet.getCurrentAddress()}).then(gas => {
                    gas += _this.additionalGas
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
                    }).catch(e => {
                        console.log(e)
                        if(e.code == -32000){//sometimes the provider loose track of the nonce, seems to only happen with BSC
                            baseWallet.selectWallet(baseWallet.selectedWallet)
                            web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending").then(newNonce => {
                                nonce = newNonce
                                swapExactETHForToken()
                            })
                        }
                    })
                })
            }

            if(route[0].toLowerCase() == WETH.toLowerCase()){
                swapExactETHForToken()
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
                }).catch(e => {
                    console.log(e)
                    if(e.code == -32000){//sometimes the provider loose track of the nonce, seems to only happen with BSC
                        baseWallet.selectWallet(baseWallet.selectedWallet)
                        web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending").then(newNonce => {
                            nonce = newNonce
                            swapExactTokenForBNB(approveHash, gas)
                        })
                    }
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
                }).catch(e => {
                    console.log(e)
                    if(e.code == -32000){//sometimes the provider loose track of the nonce, seems to only happen with BSC
                        baseWallet.selectWallet(baseWallet.selectedWallet)
                        web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending").then(newNonce => {
                            nonce = newNonce
                            swapExactTokenForToken(approveHash, gas)
                        })
                    }
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
                    token.methods.approve(_this.proxyAddress, web3.utils.toBN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).estimateGas().then(gas => {
                        token.methods.approve(_this.proxyAddress, web3.utils.toBN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).send({nonce: nonce, gasPrice: gasPrice, gas: gas}).on("transactionHash", hash => {
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
