class AtomicSwapUtils {

    constructor() {
        this.pendingOrders = new Map()

        setInterval(() => {

            this.pendingOrders.forEach(async (order, k) => {

                if(order.lockIndexB === undefined){
                    const remoteOrderReq = await fetch("https://atomicswap.virgo.net:2083/api/order/"+order.id)
                    const remoteOrder = await remoteOrderReq.json()

                    if(remoteOrder.lockIndexB != undefined) {
                        if(order.chainIdB === undefined){
                            switch (order.tickerB){
                                case "BNB":
                                    order.chainIdB = 56
                                    break
                                case "MATIC":
                                    order.chainIdB = 137
                                    break
                                case "ETH":
                                    order.chainIdB = 1
                            }
                        }

                        const chain = baseWallet.getChainByID(order.chainIdB)
                        const tempWeb3 = baseWallet.getWeb3ByID(order.chainIdB)

                        const lockContract = new tempWeb3.eth.Contract(ATOMIC_LOCKER, chain.atomicSwapParams.lockerAddress)

                        const gasLimit = await lockContract.methods.unlock(remoteOrder.lockIndexB, order.secret).estimateGas({from: order.address})
                        const gasPrice = await tempWeb3.eth.getGasPrice()

                        if(web3.utils.toBN(await tempWeb3.eth.getBalance(order.address)).gt(web3.utils.toBN(gasLimit).mul(web3.utils.toBN(gasPrice)))){
                            console.log("unlocking ourself")
                            lockContract.methods.unlock(remoteOrder.lockIndexB, order.secret).send({from: order.address, gas: gasLimit, gasPrice: gasPrice}).on("transactionHash", hash => {
                                order.unlockHash = hash
                                order.lockIndexB = remoteOrder.lockIndexB
                                order.status = 2
                                AtomicSwapUtils.saveOrder(order)
                                console.log("unlocked: " + hash)
                            })
                        }else{
                            const unlockReq = await fetch("https://atomicswap.virgo.net:2083/api/order/" + order.id + "/unlock/" + order.secret)
                            const unlockRes = await unlockReq.json()

                            if (unlockRes.hash != undefined) {
                                order.unlockHash = unlockRes.hash
                                order.lockIndexB = remoteOrder.lockIndexB
                                order.status = 2
                                AtomicSwapUtils.saveOrder(order)
                            }
                        }


                    }
                }

                if(order.gasUsed === undefined){
                    if(order.chainIdA === undefined){
                        order.status = -1
                        AtomicSwapUtils.saveOrder(order)
                        return
                    }
                    const chainA = baseWallet.getChainByID(order.chainIdA)
                    const tempWeb3 = new Web3(chainA.rpcURL)

                    tempWeb3.eth.getTransactionReceipt(order.lockHashA).then(async receipt => {
                        if(receipt == null) return

                        order.gasUsed = receipt.gasUsed
                        AtomicSwapUtils.saveOrder(order)
                    })
                }

                if(order.status == 2){
                    if(order.chainIdB === undefined){
                        order.status = -1
                        AtomicSwapUtils.saveOrder(order)
                    }
                    const chainB = baseWallet.getChainByID(order.chainIdB)
                    const tempWeb3 = new Web3(chainB.rpcURL)

                    tempWeb3.eth.getTransactionReceipt(order.unlockHash).then(async receipt => {
                        if(receipt == null)
                            return

                        if(!receipt.status){
                            const unlockReq = await fetch("https://atomicswap.virgo.net:2083/api/order/" + order.id + "/unlock/" + order.secret)
                            const unlockRes = await unlockReq.json()

                            if (unlockRes.hash != undefined) {
                                order.unlockHash = unlockRes.hash
                                order.status = 2
                            }
                        }else
                            order.status = 3

                        AtomicSwapUtils.saveOrder(order)
                    })
                }

            })

            }, 5000)
    }

    addOrder(order){
        if(order.status == -1 || order.status == 3 || this.pendingOrders.has(order.id))
            return

        this.pendingOrders.set(order.id, order)
    }

    static saveOrder(order){
        const chainA = baseWallet.getChainByID(order.chainIdA)
        const chainB = baseWallet.getChainByID(order.chainIdB)

        for(let transaction of chainA.transactions)
            if(transaction.hash == order.lockHashA)
                transaction.swapInfos = order

        for(let transaction of chainB.transactions)
            if(transaction.hash == order.lockHashA)
                transaction.swapInfos = order

        baseWallet.save()
    }

    /**
     * @param chainA chain ID of the asset we swap from
     * @returns {Promise<void>} JSON Object containing gas costs for both lock and retrieve
     */
    static async estimateLockFees(chainId) {
        const chain = baseWallet.getChainByID(chainId)
        const tempWeb3 = new Web3(chain.rpcURL)

        const lockContract = new tempWeb3.eth.Contract(ATOMIC_LOCKER, chain.atomicSwapParams.lockerAddress)

        const gasPrice = await tempWeb3.eth.getGasPrice()

        const gasAmount = await lockContract.methods.lock(baseWallet.getCurrentAddress(), "0xb1fabb5fd9d6c42c96f920ef8c1b911093301487e01c13c1c35be96ae7dca14a", 600000).estimateGas({"value": 1})

        return {
            gasPrice: gasPrice,
            gas: gasAmount
        }
    }

    static async initAtomicSwap(amount, chainIdA, chainIdB, gasPrice){
        const chainA = baseWallet.getChainByID(chainIdA)
        const chainB = baseWallet.getChainByID(chainIdB)
        const tempWeb3 = baseWallet.getWeb3ByID(chainIdA)

        const lockContract = new tempWeb3.eth.Contract(ATOMIC_LOCKER, chainA.atomicSwapParams.lockerAddress)

        const secret = tempWeb3.utils.randomHex(32)
        const hash = "0x" + sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(sjcl.codec.hex.toBits(secret)))

        const orderReq = await fetch("https://atomicswap.virgo.net:2083/api/order/create/"+chainA.ticker+"/"+chainB.ticker+"/"+amount+"/"+baseWallet.getCurrentAddress())
        const order = await orderReq.json()

        if(order.error != undefined)
            return order

        let nonce = await tempWeb3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending")

        const gasAmount = await lockContract.methods.lock(order.depositAddress, hash, 10800000).estimateGas({"value": amount, "from": baseWallet.getCurrentAddress()})

        return await new Promise(resolve => {

            lockContract.methods.lock(order.depositAddress, hash, 10800000).send({
                "value": amount,
                "gas": gasAmount,
                "gasPrice": gasPrice,
                "from": baseWallet.getCurrentAddress(),
                "nonce": nonce
            })
                .on("transactionHash", async hash => {
                    order.lockHashA = hash
                    order.secret = secret
                    order.status = 1
                    order.chainIdA = chainIdA
                    order.chainIdB = chainIdB

                    atomicSwap.addOrder(order)

                    const txResume = {
                        "hash": hash,
                        "contractAddr": "ATOMICSWAP",
                        "date": Date.now(),
                        "recipient": chainA.atomicSwapParams.lockerAddress,
                        "amount": 0,
                        "gasPrice": gasPrice,
                        "gasLimit": gasAmount,
                        "nonce": nonce,
                        "swapInfos": order
                    }

                    chainA.atomicSwapParams.orders.push(order)

                    chainA.transactions.unshift(txResume)
                    chainB.transactions.unshift(txResume)

                    AtomicSwapUtils.saveOrder(order)

                    const updateOrderReq = await fetch("https://atomicswap.virgo.net:2083/api/order/" + order.id + "/update/" + hash)

                    resolve(true)
                })
        })
    }

}

const atomicSwap = new AtomicSwapUtils()
