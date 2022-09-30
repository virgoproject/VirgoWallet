class Uniswap03Utils {

    constructor(proxyAddress, quoterAddress, factoryAddress, tokens) {
        this.proxyAddress = proxyAddress
        this.quoterAddress = quoterAddress
        this.factoryAddress = factoryAddress

        this.quoter = new web3.eth.Contract(UNI_QUOTERV2, quoterAddress)
        this.factory = new web3.eth.Contract(UNI_FACTORY03, factoryAddress)
        this.proxy = new web3.eth.Contract(VIRGOSWAP_3, proxyAddress)

        this.tokens = tokens

        this.feesByRoutes = new Map()

        this.defaultSwapGas = 600000
        this.additionalGas = 50000
        this.baseSwapFee = 0.01
    }

    async findRoute(amount, tokenA, tokenB) {

        const WETH = await this.getWETH()

        let routes = [];
        let feeByDirectRoute = new Map()
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

                if(routes.length == 0){
                    resolve(false)
                    return
                }

                let identifier = ""
                for(let step of routes[0].route)
                    identifier+=step

                _this.feesByRoutes.set(identifier, routes[0].fees)

                resolve(routes[0])
            }

            let A_WETH;
            let B_WETH;

            //check if has direct pair and add it
            if(tokenA.toLowerCase() != WETH.toLowerCase() && tokenB.toLowerCase() != WETH.toLowerCase()){
                _this.getAmountOutAllFees(amount, [tokenA, tokenB]).then(amountOut => {
                    if(!amountOut){
                        maxRoutes--;
                    }else{
                        routes.push({
                            route: [tokenA, tokenB],
                            amount: amountOut.amount,
                            fees: [amountOut.fee]
                        })
                        feeByDirectRoute.set(tokenA + tokenB, amountOut.fee)
                    }
                    checkFinished()
                })

                const A_res = await _this.getAmountOutAllFees(amount, [tokenA, WETH])
                A_WETH = A_res != false
                if(A_WETH)
                    feeByDirectRoute.set(tokenA + WETH, A_res.fee)

                const B_res = await _this.getAmountOutAllFees(amount, [tokenB, WETH])
                B_WETH = B_res != false
                if(B_WETH)
                    feeByDirectRoute.set(tokenB + WETH, B_res.fee)

            }else{
                const res = await _this.getAmountOutAllFees(amount, [tokenA, tokenB])
                if(tokenA.toLowerCase() == WETH.toLowerCase()){
                    A_WETH = false
                    B_WETH = res != false
                }else{
                    A_WETH = res != false
                    B_WETH = false
                }
                if(res != false){
                    routes.push({
                        route: [tokenA, tokenB],
                        amount: res.amount,
                        fees: [res.fee]
                    })
                    if(tokenA.toLowerCase() == WETH.toLowerCase())
                        feeByDirectRoute.set(tokenB + WETH, res.fee)
                    else
                        feeByDirectRoute.set(tokenA + WETH, res.fee)
                } else {
                    maxRoutes--;
                    checkFinished()
                }
            }

            if(A_WETH && B_WETH){
                const fees = [feeByDirectRoute.get(tokenA + WETH), feeByDirectRoute.get(tokenB + WETH)]
                _this.getAmountOut(amount, [tokenA, WETH, tokenB], fees).then(amountOut => {
                    routes.push({
                        route: [tokenA, WETH, tokenB],
                        amount: amountOut,
                        fees: fees
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

                _this.getAmountOutAllFees(amount, [token, WETH]).then(token_WETH => {

                    if(token_WETH != false)
                        feeByDirectRoute.set(token + WETH, token_WETH.fee)
                    token_WETH = token_WETH != false

                    _this.getAmountOutAllFees(amount, [tokenA, token]).then(A_token => {

                        if(A_token != false)
                            feeByDirectRoute.set(tokenA + token, A_token.fee)
                        A_token = A_token != false

                        _this.getAmountOutAllFees(amount, [tokenB, token]).then(B_token => {

                            if(B_token != false)
                                feeByDirectRoute.set(tokenB + token, B_token.fee)
                            B_token = B_token != false

                            if(A_token && B_token) {
                                const fees = [feeByDirectRoute.get(tokenA + token), feeByDirectRoute.get(tokenB + token)]
                                _this.getAmountOut(amount, [tokenA, token, tokenB], fees).then(pairAmount => {
                                    routes.push({
                                        route: [tokenA, token, tokenB],
                                        amount: pairAmount,
                                        fees: fees
                                    })
                                    checkFinished()
                                })
                            } else {
                                maxRoutes--;
                                checkFinished()
                            }

                            if(!token_WETH){
                                maxRoutes -= 2;
                                checkFinished()
                                return
                            }

                            if(((A_token && B_token && A_WETH) || (!A_token && B_token && A_WETH)) && tokenB.toLowerCase() != WETH.toLowerCase()){
                                const fees = [feeByDirectRoute.get(tokenA + WETH), feeByDirectRoute.get(token + WETH), feeByDirectRoute.get(tokenB + token)]
                                _this.getAmountOut(amount, [tokenA, WETH, token, tokenB], fees).then(pairAmount => {
                                    routes.push({
                                        route: [tokenA, WETH, token, tokenB],
                                        amount: pairAmount,
                                        fees: fees
                                    })
                                    checkFinished()
                                })
                            } else {
                                maxRoutes--;
                                checkFinished()
                            }

                            if(((A_token && B_token && B_WETH) || (A_token && !B_token && B_WETH)) && tokenA.toLowerCase() != WETH.toLowerCase()){
                                const fees = [feeByDirectRoute.get(tokenA + token), feeByDirectRoute.get(token + WETH), feeByDirectRoute.get(tokenB + WETH)]
                                _this.getAmountOut(amount, [tokenA, token, WETH, tokenB], fees).then(pairAmount => {
                                    routes.push({
                                        route: [tokenA, token, WETH, tokenB],
                                        amount: pairAmount,
                                        fees: fees
                                    })
                                    checkFinished()
                                })
                            } else {
                                maxRoutes--;
                                checkFinished()
                            }

                        })
                    })
                })
            }

        })

    }

    async getAmountOutAllFees(amount, path){
        if(path[0] == path[1])
            return false

        const amounts = []
        const fees = [100,500,3000,10000]

        const _this = this

        return await new Promise(resolve => {
            let maxRes = fees.length
            for(const fee of fees){
                _this.getAmountOut(amount, path, [fee]).then(amountOut => {
                    if(!amountOut){
                        maxRes--;
                    }else{
                        amounts.push({
                            amount: amountOut,
                            fee: fee
                        })
                    }
                    if(amounts.length >= maxRes){
                        if(amounts.length == 0)
                            resolve(false)

                        amounts.sort(function(a, b){
                            if(a.amount.eq(b.amount)) return 0
                            if(a.amount.lt(b.amount)) return 1
                            return -1
                        })

                        resolve(amounts[0])
                    }
                })
            }
        })

    }

    async getAmountOut(amount, path, fees){
        try {
            return web3.utils.toBN(await this.quoter.methods.quoteExactInput(this.encodePath(path, fees), amount).call())
        }catch(e){
            return false
        }
    }

    async estimateSwapFees(amount, route){
        const WETH = await this.getWETH()

        let identifier = ""
        for(let step of route)
            identifier+=step

        const fees = this.feesByRoutes.get(identifier)

        let cumuledFees = this.baseSwapFee
        for(let fee of fees){
            console.log(fee)
            cumuledFees+=(fee/1000000)
        }


        if(route[0].toLowerCase() == WETH.toLowerCase())
            return {
                gas: await this.proxy.methods.swapExactETHForToken(route, fees).estimateGas({from: baseWallet.getCurrentAddress(), value: amount}) + this.additionalGas,
                feesRate: cumuledFees
            }

        const token = new web3.eth.Contract(ERC20_ABI, route[0], { from: baseWallet.getCurrentAddress()});

        const allowance = await token.methods.allowance(baseWallet.getCurrentAddress(), this.proxyAddress).call()

        if(web3.utils.toBN(allowance).lt(amount)){
            return {
                gas: this.defaultSwapGas + await token.methods.approve(this.proxyAddress, web3.utils.toBN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).estimateGas(),
                feesRate: cumuledFees
            }
        }

        if(route[route.length-1].toLowerCase() == WETH.toLowerCase())
            return {
                gas: await this.proxy.methods.swapExactTokenForETH(amount, route, fees).estimateGas({ from: baseWallet.getCurrentAddress()}) + this.additionalGas,
                feesRate: cumuledFees
            }

        return {
            gas: await this.proxy.methods.swapExactTokenForToken(amount, route, fees).estimateGas({ from: baseWallet.getCurrentAddress()}) + this.additionalGas,
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

    async getWETH(){
        if(this.WETH === undefined)
            this.WETH = await this.quoter.methods.WETH9().call()

        return this.WETH
    }

}
