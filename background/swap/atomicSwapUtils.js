class AtomicSwapUtils {

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

    static async initAtomicSwap(amount, chainA, chainB, gasPrice){
        const chain = baseWallet.getChainByID(chainA)
        const tempWeb3 = new Web3(chain.rpcURL)

        const lockContract = new tempWeb3.eth.Contract(ATOMIC_LOCKER, chain.atomicSwapParams.lockerAddress)

        const secret = tempWeb3.utils.randomHex(32).substring(2)
        const hash = "0x" + sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(secret))


        const orderReq = await fetch("http://localhost/api/order/create/"+chainA+"/"+chainB+"/"+amount+"/"+baseWallet.getCurrentAddress())
        const order = await orderReq.json()

        const gasAmount = await lockContract.methods.lock(order.depositAddress, hash, 600000).estimateGas({"value": amount})



    }

}
