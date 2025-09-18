class CrossSwapUtils {

    constructor() {
        //setInterval(this.update, 10000)
    }

    static async getSwapRoute(chainA, tokenA, chainB, tokenB, amount){

        if(chainA == chainB){
            return await baseWallet.getChainByID(chainA).swap().getSwapRoute(amount, tokenA, tokenB)
        }

        try {
            const req = await fetch("https://swap.virgo.net/api/v2/quote/"+chainA+"/"+tokenA+"/"+chainB+"/"+tokenB+"/"+amount)
            const json = await req.json()

            console.log(json)

            if(json.error != undefined || json.routes === undefined)
                return json

            if(json.routes.length == 0)
                json.error = true

            return json

        }catch (e) {
            return false
        }
    }

    static async estimateSwapFees(chainA, tokenA, chainB, tokenB, amount, quote){

        if(chainA == chainB){
            return await baseWallet.getChainByID(chainA).swap().estimateSwapFees(amount, quote)
        }

        const web3A = baseWallet.getWeb3ByID(chainA)

        if(baseWallet.getChainByID(chainA).ticker == tokenA){
            const gas = await web3A.eth.estimateGas({from: baseWallet.getCurrentAddress(), to: "0xdb65702a9b26f8a643a31a4c84b9392589e03d7c"})
            return {
                gas,
                feesRate: 0
            }
        }

        const contract = new web3A.eth.Contract(ERC20_ABI, tokenA, { from: baseWallet.getCurrentAddress()});

        const gas = await contract.methods.transfer("0xdb65702a9b26f8a643a31a4c84b9392589e03d7c", amount).estimateGas()

        return {
            gas,
            feesRate: 0
        }
    }

    static async initSwap(chainA, tokenA, chainB, tokenB, amount, quote, gasLimit, gasPrice){

        if(chainA == chainB){
            return await baseWallet.getChainByID(chainA).swap().initSwap(amount, quote, gasPrice)
        }

        const web3A = baseWallet.getWeb3ByID(chainA)

        const req = await fetch("https://swap.virgo.net/api/v2/order/simpleswap/create/"+baseWallet.getCurrentAddress()+"/"+chainA+"/"+tokenA+"/"+chainB+"/"+tokenB+"/"+amount)
        const json = await req.json()

        if(json.address_from === undefined){
            //TODO handle errors
            return
        }

        const nonce = await web3A.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending")

        return await new Promise(resolve => {
            if(baseWallet.getChainByID(chainA).ticker == tokenA){
                web3A.eth.sendTransaction({
                    from: baseWallet.getCurrentAddress(),
                    to: json.address_from,
                    value: amount,
                    gas: 21000,
                    gasPrice: gasPrice,
                    nonce
                }).on("transactionHash", hash => {

                    try{
                        fetch(`https://airdrops.virgo.net:2083/api/reward/swap/register/simpleswap/${json.id}`)
                    }catch (e) {}

                    baseWallet.crossSwaps.unshift({
                        hash,
                        contractAddr: "SIMPLESWAP",
                        "date": Date.now(),
                        recipient: json.address_from,
                        amount: amount.toString(),
                        gasLimit,
                        gasPrice,
                        nonce,
                        origin: "Virgo Swap",
                        from: baseWallet.getCurrentAddress(),
                        cross: true,
                        swapInfos: {
                            chainA,
                            tokenA,
                            chainB,
                            tokenB,
                            "ssOrderID": json.id,
                            quote,
                            ssStatus: "waiting",
                            status: 0,
                            amountIn: amount.toString()
                        },
                    })
                    baseWallet.save()
                    resolve(true)
                })
                return
            }

            const contract = new web3A.eth.Contract(ERC20_ABI, tokenA, {from: baseWallet.getCurrentAddress()});
            const transaction = contract.methods.transfer(json.address_from, amount);

            transaction.send({gas: gasLimit, gasPrice: gasPrice, nonce: nonce})
                .on("transactionHash", hash => {

                    try{
                        fetch(`https://airdrops.virgo.net:2083/api/reward/swap/register/simpleswap/${json.id}`)
                    }catch (e) {}

                    baseWallet.crossSwaps.unshift({
                        hash,
                        contractAddr: "SIMPLESWAP",
                        "date": Date.now(),
                        recipient: json.address_from,
                        amount: amount.toString(),
                        gasLimit,
                        gasPrice,
                        nonce,
                        origin: "Virgo Swap",
                        from: baseWallet.getCurrentAddress(),
                        cross: true,
                        swapInfos: {
                            chainA,
                            tokenA,
                            chainB,
                            tokenB,
                            "ssOrderID": json.id,
                            quote,
                            ssStatus: "waiting",
                            status: 0,
                            amountIn: amount.toString()
                        },
                    })
                    baseWallet.save()
                    resolve(true)
                })
        })
    }

    static async updateSimpleSwapOrder(order){
        if(order.swapInfos.status == "-1" || order.swapInfos.status == "3") return

        const res = await fetch("https://swap.virgo.net/api/v2/order/simpleswap/get/"+order.swapInfos.ssOrderID)
        const json = await res.json()

        if(json.status === undefined) return

        if(order.swapInfos.ssStatus == json.status) return

        order.swapInfos.ssStatus = json.status

        switch(json.status){
            case "waiting":
                order.swapInfos.status = 0
                break
            case "confirming":
            case "verifying":
            case "exchanging":
                order.swapInfos.status = 1
                break
            case "sending":
                order.swapInfos.status = 2
                break
            case "finished":
                order.swapInfos.status = 3
                break
            case "expired":
            case "failed":
            case "refunded":
                order.swapInfos.status = -1
                break
        }

        if(json.amount_to != undefined){
            const tokenB = await new Promise(resolve => {TokensHandlers.getTokenDetailsCross({contract: order.swapInfos.tokenB, chainID: order.swapInfos.chainB}, null, resolve)})
            let decimals = 18
            if(tokenB) decimals = tokenB.decimals
            order.swapInfos.amountOut = Utils.toAtomicString(json.amount_to, decimals)
        }

        baseWallet.save()
    }

    static async updateTransakOrder(order){
        if(order.swapInfos.status == "-1" || order.swapInfos.status == "3") return

        const res = await fetch("https://swap.virgo.net/api/v2/order/transak/get/"+order.swapInfos.orderID)
        let json = await res.json()
        json = json.data

        console.log(json)
        order.swapInfos.trStatus = json.status

        switch(json.status){
            case "AWAITING_PAYMENT_FROM_USER":
                order.swapInfos.status = 0
                break
            case "PAYMENT_DONE_MARKED_BY_USER":
            case "PROCESSING":
                order.swapInfos.status = 1
                break
            case "PENDING_DELIVERY_FROM_TRANSAK":
            case "ON_HOLD_PENDING_DELIVERY_FROM_TRANSAK":
                order.swapInfos.status = 2
                break
            case "COMPLETED":
                order.swapInfos.status = 3
                break
            case "CANCELLED":
            case "FAILED":
            case "REFUNDED":
            case "EXPIRED":
                order.swapInfos.status = -1
                break
        }

        if(json.cryptoAmount !== undefined){
            const tokenB = await new Promise(resolve => {TokensHandlers.getTokenDetailsCross({contract: order.swapInfos.tokenB, chainID: order.swapInfos.chainB}, null, resolve)})
            let decimals = 18
            if(tokenB) decimals = tokenB.decimals
            order.swapInfos.amountOut = Utils.toAtomicString(json.cryptoAmount, decimals)
        }

        console.log(order)

        baseWallet.save()
    }

    update(){
        for(const swap of baseWallet.crossSwaps){
            if(swap.contractAddr == "SIMPLESWAP"){
                CrossSwapUtils.updateSimpleSwapOrder(swap)
            }

            if(swap.contractAddr == "TRANSAK"){
                CrossSwapUtils.updateTransakOrder(swap)
            }
        }
    }

}

crossSwaps = new CrossSwapUtils()
