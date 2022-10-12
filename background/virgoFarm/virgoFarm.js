class VirgoFarm{

    static infos = {
        farmAddress :"0xcd30df3aa3578228e7c2c601d653c1bd32d02988",
        tokenAddress : "0xFb526228ff1C019E4604C7e7988C097D96bD5b70"
    }

    static getContract(){
        return new web3.eth.Contract(VIRGOFARM_ABI, VirgoFarm.infos.farmAddress, { from: baseWallet.getCurrentAddress()})
    }

    static getTokenContract(){
        return new web3.eth.Contract(ERC20_ABI, VirgoFarm.infos.tokenAddress, { from: baseWallet.getCurrentAddress()})
    }

     static async getLocks(){
        const contract = VirgoFarm.getContract()
        let locksCount = await contract.methods.getLocksCount(baseWallet.getCurrentAddress()).call()
        let locks = []

        for(let i = 0; i < locksCount; i++){
            const res = await contract.methods.getLock(baseWallet.getCurrentAddress(), i).call()
            locks.push({
                amount : res[0],
                effectiveAmount : res[1],
                unlockTime : res[2],
                lockDuration : res[3],
                earnings : res[4],
                totalEarnings : res[5]
            })

        }
        return locks
           //stack.amount, stack.effectiveAmount, stack.unlockTime, stack.lockDuration, stack.earnings, stack.totalEarnings
         //Lockduration = weeks
    }

    static async createStake(amount,duration){
        const tokenContract = VirgoFarm.getTokenContract()
        const allowance = await tokenContract.methods.allowance(baseWallet.getCurrentAddress(),VirgoFarm.infos.farmAddress).call()
        const balance = await web3.eth.getBalance(baseWallet.getCurrentAddress())
        const gasprice = await web3.eth.getGasPrice()
        const allowanceGas = await tokenContract.methods.approve(VirgoFarm.infos.farmAddress,6003200000000000).estimateGas()
        const contract = VirgoFarm.getContract()
        const gas = await contract.methods.lock(amount,duration).estimateGas()
        if ((gas + allowanceGas) * gasprice > balance) return false

        if(allowance < amount){
            await tokenContract.methods.approve(VirgoFarm.infos.farmAddress,6003200000000000).send({gas:allowanceGas})
        }

        await contract.methods.lock(amount,duration).send({gas:gas})
        return true
    }

    static async retrieveEarnings(index){
        const balance = await web3.eth.getBalance(baseWallet.getCurrentAddress())
        const gasprice = await web3.eth.getGasPrice()

        const contract = VirgoFarm.getContract()
        const gas = await contract.methods.retrieveEarnings(index).estimateGas()
        if (gasprice * gas > balance) return false
        await contract.methods.retrieveEarnings(index).send({gas:gas})
        return true
    }

    static async unlock(index){
        const balance = await web3.eth.getBalance(baseWallet.getCurrentAddress())
        const gasprice = await web3.eth.getGasPrice()

        const contract = VirgoFarm.getContract()
        const gas = await contract.methods.unlock(index).estimateGas()
        if (gasprice * gas > balance) return false
        await contract.methods.unlock(index).send({gas:gas})

        return true
    }
}
