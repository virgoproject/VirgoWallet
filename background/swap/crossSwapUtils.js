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

    static async estimateSwapFees(chainA, tokenA, chainB, tokenB, amount, quote){

        if(chainA == chainB){
            return await baseWallet.getChainByID(chainA).estimateSwapFees(amount, quote)
        }

        const web3A = baseWallet.getWeb3ByID(chainA)

        if(chainA == tokenA){
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
            return await baseWallet.getChainByID(chainA).initSwap(amount, quote, gasPrice)
        }

        const web3A = baseWallet.getWeb3ByID(chainA)

        const req = await fetch("http://localhost/api/v2/order/simpleswap/create/"+baseWallet.getCurrentAddress()+"/"+chainA+"/"+tokenA+"/"+chainB+"/"+tokenB+"/"+amount)
        const json = await req.json()

        if(json.address_from === undefined){
            //TODO handle errors
            return
        }

        const nonce = await web3A.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending")

        return await new Promise(resolve => {
            if(chainA == tokenA){
                web3A.eth.sendTransaction({
                    from: baseWallet.getCurrentAddress(),
                    to: json.address_from,
                    value: amount,
                    gas: 21000,
                    gasPrice: gasPrice,
                    nonce
                }).on("transactionHash", hash => {
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
                        swapInfos: {
                            chainA,
                            tokenA,
                            chainB,
                            tokenB,
                            "ssOrderID": json.id,
                            quote,
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
                        swapInfos: {
                            chainA,
                            tokenA,
                            chainB,
                            tokenB,
                            "ssOrderID": json.id,
                            quote,
                        },
                    })
                    baseWallet.save()
                    resolve(true)
                })
        })
    }

}
