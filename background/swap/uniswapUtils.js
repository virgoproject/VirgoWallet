class UniswapUtils {

    constructor(routerAddress, factoryAddress, tokens) {
        this.routerAddress = routerAddress
        this.factoryAddress = factoryAddress

        this.router = new web3.eth.Contract(UNI_ROUTER02, routerAddress);
        this.factory = new web3.eth.Contract(UNI_FACTORY, factoryAddress);

        this.tokens = tokens
    }

    async findRoute(amount, tokenA, tokenB) {
        console.log(amount)
        console.log(tokenA)
        console.log(tokenB)

        const WETH = await this.router.methods.WETH().call()

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

        return bestRoute
    }

    async getAmountOut(amount, route){
        const amountOut = await this.router.methods.getAmountsOut(amount, route).call()
        return web3.utils.toBN(amountOut[amountOut.length-1])
    }

}
