class UniswapUtils {

    constructor(proxyAddress, routerAddress, factoryAddress, tokens, feesRate) {
        this.proxyAddress = proxyAddress
        this.routerAddress = routerAddress
        this.factoryAddress = factoryAddress
        this.feesRate = feesRate

        this.router = new web3.eth.Contract(UNI_ROUTER02, routerAddress)
        this.factory = new web3.eth.Contract(UNI_FACTORY, factoryAddress)
        this.proxy = new web3.eth.Contract(VIRGOSWAP, proxyAddress)

        this.tokens = tokens
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

        const token = new web3.eth.Contract(ERC20_ABI, route[0], { from: baseWallet.getCurrentAddress()});

        const allowance = await token.methods.allowance(baseWallet.getCurrentAddress(), this.proxyAddress).call()

        console.log(allowance)

        if(allowance < amount){
            console.log("allowance < amount")
            return {
                gas: 200000 + await token.methods.approve(this.proxyAddress, web3.utils.toBN("115792089237316195423570985008687907853269984665640564039457584007913129639935")).estimateGas(),
                feesRate: 0.01 + (route.length-1)*this.feesRate
            }
        }

        if(route[0] == WETH)
                return {
                    gas: await this.proxy.methods.swapExactBNBForToken(route).estimateGas({value: amount}),
                    feesRate: 0.01 + (route.length-1)*this.feesRate
                }
        else if(route[route.length-1] == WETH)
                return {
                    gas: await this.proxy.methods.swapExactTokenForBNB(amount, route).estimateGas(),
                    feesRate: 0.01 + (route.length-1)*this.feesRate
                }
        else
            return {
                gas: await this.proxy.methods.swapExactTokenForToken(amount, route).estimateGas(),
                feesRate: 0.01 + (route.length-1)*this.feesRate
            }
    }

    async getWETH(){
        if(this.WETH === undefined)
            this.WETH = await this.router.methods.WETH().call()

        return this.WETH
    }

}
