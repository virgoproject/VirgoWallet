class CrossSwapUtils {

    static async getSwapRoute(chainA, tokenA, chainB, tokenB, amount){

        if(chainA == chainB){
            return await baseWallet.getChainByID(chainA).getSwapRoute(amount, tokenA, tokenB)
        }

        try {
            const req = await fetch("http://localhost/api/v2/quote/"+chainA+"/"+tokenA+"/"+chainB+"/"+tokenB+"/"+amount)
            const json = await req.json()

            if(json.error != undefined || json.routes === undefined)
                return json

            if(json.routes.length == 0)
                json.error = true

            return json

        }catch (e) {
            return false
        }
    }

    static async estimateSwapFees(amount, quote){

        if(chainA == chainB){
            return await baseWallet.getChainByID()
        }

    }

}
