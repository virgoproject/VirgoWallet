class AtomicSwapUtils {

    constructor() {
        this.pendingOrders = new Map()

        setInterval(() => {

            this.pendingOrders.forEach(async (order, k) => {

                if(order.lockIndexB === undefined){
                    const remoteOrderReq = await fetch("http://localhost/api/order/"+order.id)
                    const remoteOrder = await remoteOrderReq.json()

                    if(remoteOrder.lockIndexB != undefined) {

                        const unlockReq = await fetch("http://localhost/api/order/" + order.id + "/unlock/" + order.secret)
                        const unlockRes = await unlockReq.json()

                        if (unlockRes.hash != undefined) {
                            order.unlockHash = unlockRes.hash
                            order.lockIndexB = remoteOrder.lockIndexB
                            order.status = 2
                            baseWallet.save()
                        }
                    }
                }

            })

            }, 5000)
    }

    addOrder(order){
        if(order.status != -1 || order.status != 3)
            this.pendingOrders.set(order.id, order)
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
        const tempWeb3 = new Web3(chainA.rpcURL)

        const pKey = "0x" + Converter.bytesToHex(web3._provider.wallets[baseWallet.getCurrentAddress()].privateKey)

        const account = tempWeb3.eth.accounts.privateKeyToAccount(pKey)
        tempWeb3.eth.accounts.wallet.add(account)

        const lockContract = new tempWeb3.eth.Contract(ATOMIC_LOCKER, chainA.atomicSwapParams.lockerAddress)

        const secret = tempWeb3.utils.randomHex(32)
        const hash = "0x" + sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(sjcl.codec.hex.toBits(secret)))

        const orderReq = await fetch("http://localhost/api/order/create/"+chainA.ticker+"/"+chainB.ticker+"/"+amount+"/"+baseWallet.getCurrentAddress())
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
                    atomicSwap.addOrder(order)

                    chainA.transactions.unshift({
                        "hash": hash,
                        "contractAddr": "ATOMICSWAP",
                        "date": Date.now(),
                        "recipient": chainA.atomicSwapParams.lockerAddress,
                        "amount": 0,
                        "gasPrice": gasPrice,
                        "gasLimit": gasAmount,
                        "nonce": nonce,
                        "swapInfos": order
                    })

                    baseWallet.save()

                    const updateOrderReq = await fetch("http://localhost/api/order/" + order.id + "/update/" + hash)

                    resolve(true)
                })
        })
    }

}

const atomicSwap = new AtomicSwapUtils()