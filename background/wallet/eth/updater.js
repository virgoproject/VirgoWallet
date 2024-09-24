class EthWalletUpdater {

    constructor(ethWallet) {

        this.wallet = ethWallet

        this.trackedUpdateIndex = 0
        this.untrackedUpdateIndex = 0
        this.updateBatchSize = 50

        this.multicall = new this.wallet.web3.eth.Contract(MULTICALL3, "0xcA11bde05977b3631167028862bE2a173976CA11")

        this.fetchTokens()

        const _this = this

        const timer = setInterval(function(){
            if(baseWallet !== _this.wallet.baseWalletInst){
                clearInterval(timer)
                return
            }
            try{
                _this.update()
            }catch(e){
                console.log("Failed to update " + this.wallet.name + " balances:")
                console.log(e)
            }
        }, 5000)

        const transactionsTimer = setInterval(function(){
            if(baseWallet !== _this.wallet.baseWalletInst){
                clearInterval(transactionsTimer)
                return
            }
            try{
                _this.updateTransactions()
            }catch(e){
                console.log("Failed to update " + this.wallet.name + " transactions:")
                console.log(e)
            }
        }, 5000)

        const startupWait = setInterval(() => {
            if(_this.wallet.getAddressesJSON().length === 0) return
            clearInterval(startupWait)
            try{
                _this.update()
            }catch(e){
                console.log("Failed to update " + this.wallet.name + " balances:")
                console.log(e)
            }
        }, 50)

        const priceTimer = setInterval(function(){
            if(baseWallet !== _this.wallet.baseWalletInst){
                clearInterval(priceTimer)
                return
            }
            _this.updatePrices()
        }, 300000)
    }

    update(){
        const _this = this

        const address = this.wallet.getCurrentAddress()

        const balances = this.wallet.getBalances(address)

        const tracked = []
        const untracked = []

        for(const tokenAddr in balances){
            const token = balances[tokenAddr]
            if(token.isNative) continue//exclude native asset as we dont update it like others
            if(token.tracked) tracked.push(tokenAddr)
            else untracked.push(tokenAddr)
        }

        _this.wallet.web3.eth.getBalance(address).then(function(res){
            balances[_this.wallet.ticker].balance = res;
        })

        if(this.trackedUpdateIndex < tracked.length){
            //update tracked tokens
            const toSelect = Math.min(tracked.length-this.trackedUpdateIndex, this.updateBatchSize)

            this.updateTokenSet(tracked.slice(this.trackedUpdateIndex, this.trackedUpdateIndex+toSelect), balances, address)

            this.trackedUpdateIndex = this.trackedUpdateIndex+toSelect

        }else{
            //update untracked tokens then set trackedIndex to zero so next time we update tracked tokens
            if(this.untrackedUpdateIndex >= untracked.length) this.untrackedUpdateIndex = 0

            const toSelect = Math.min(untracked.length-this.untrackedUpdateIndex, this.updateBatchSize)

            this.updateTokenSet(untracked.slice(this.untrackedUpdateIndex, this.untrackedUpdateIndex+toSelect), balances, address)

            this.untrackedUpdateIndex = this.untrackedUpdateIndex+toSelect

            this.trackedUpdateIndex = 0

        }

    }

    updateTokenSet(tokens, balances, address){
        const _this = this

        this.fetchTokenBalances(tokens, address).then(bals => {
            for(const bal in bals){
                const balance = bals[bal]

                if(!balance.balance) continue

                if(balances[balance.token].balance != balance.balance){
                    balances[balance.token].balance = balance.balance

                    if(balances[balance.token].autotrack && balance.balance != 0)
                        _this.wallet.changeTracking(balance.token, true)

                    _this.updatePrice(balance.token)
                }
            }
        })
    }

    updatePrices(){

        for(const token of this.wallet.tokens){
            if(!token.tracked && token.contract.toLowerCase() !== this.wallet.contract.toLowerCase()) continue

            this.updatePrice(token.contract)
        }
    }

    updatePrice(token){
        const _this = this

        fetch(`https://api.virgo.net:2053/api/token/price/${_this.wallet.chainID}/${token}/${selectedCurrency}`)
            .then(function (resp) {
                resp.json().then(function (res) {
                    if(res.price && res.change)
                        _this.wallet.prices.set(token, {
                            price: parseFloat(res.price),
                            change: parseFloat(res.change)
                        })
                })
            }).catch(function (e) {
                console.log(e)
            })
    }

    fetchTokens(){

        const _this = this

        try {
            fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/" + _this.wallet.chainID + "/infos.json")
                .then(function(resp){
                    try {
                        resp.json().then(function(res){
                            _this.wallet.CG_Platform = res.CG_Platform
                            for(let token of res.tokens){
                                try {
                                    if(!_this.wallet.hasToken(token)){
                                        fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/" + _this.wallet.chainID + "/" + token + "/infos.json")
                                            .then(function(resp2){
                                                console.log("adding " + _this.wallet.chainID + " " + token)
                                                resp2.json().then(function(res2){
                                                    console.log("added " + res2.ticker)
                                                    _this.wallet.addToken(res2.name, res2.ticker, res2.decimals, res2.contract, false)
                                                })
                                            })
                                    }
                                }catch(e){
                                    console.log(e)
                                }
                            }
                        }).catch(e => {
                            console.log(e)
                        })
                    }catch(e){
                        console.log(e)
                    }
                })
        }catch(e){
            console.log(e)
        }
    }

    async fetchTokenBalances(tokens, walletAddress) {

        const _this = this

        const calls = []

        for(const token of tokens){
            const tokenContract = new _this.wallet.web3.eth.Contract(ERC20_ABI, token)
            calls.push({
                target: token,
                allowFailure: true,
                callData: tokenContract.methods.balanceOf(walletAddress).encodeABI()
            })
        }

        const returnData = await _this.multicall.methods.aggregate3(calls).call()

        const balances = returnData.map((result, i) => {
            const { success, returnData } = result
            if (success) {
                const balance = web3.eth.abi.decodeParameter('uint256', returnData)
                return { token: tokens[i], balance }
            } else {
                return { token: tokens[i], balance: null }
            }
        });

        return balances;
    }

    updateTransactions(){
        const _this = this
        if(this.wallet.transactions.length > 0){
            web3.eth.getBlockNumber().then(function(blockNumber){
                for(const transaction of _this.wallet.transactions){
                    if((transaction.confirmations !== undefined && transaction.confirmations >= 12 || transaction.status == false || transaction.contractAddr == "ATOMICSWAP") && !(transaction.contractAddr == "SWAP" && transaction.swapInfos.amountOut == undefined)) continue

                    web3.eth.getTransactionReceipt(transaction.hash).then(async function(receipt){
                        if(receipt == null){
                            if(transaction.canceling){
                                transaction.status = false
                                transaction.gasUsed = 21000
                                transaction.gasPrice = transaction.cancelingPrice
                                baseWallet.save()
                            }
                            return
                        }

                        if(transaction.status === undefined || (transaction.contractAddr == "SWAP" && transaction.swapInfos.amountOut == undefined)){
                            if(receipt.status){

                                if(transaction.contractAddr == "SWAP"){

                                    await _this.wallet.swap().updateTransactionStatus(transaction, receipt)

                                } else if(transaction.contractAddr == "WEB3_SWAP"){

                                    try {
                                        switch (transaction.swapInfos.type){
                                            case 'swapExactETHForTokens':
                                            case 'exactInput':
                                            case 'exactInputSingle':
                                            case 'swapExactETHForTokensSupportingFeeOnTransferTokens':
                                            case 'swapExactTokensForTokensSupportingFeeOnTransferTokens':
                                            case 'swapExactTokensForTokens':
                                            case 'swapExactTokensForETHSupportingFeeOnTransferTokens':
                                            case 'swapExactTokensForETH':
                                                let log = receipt.logs[receipt.logs.length-1]

                                                let decodedLog = null

                                                for(let nLog of receipt.logs){
                                                    if(nLog.address.toLowerCase() == transaction.swapInfos.tokenOut.toLowerCase()){
                                                        log = nLog
                                                        try {
                                                            decodedLog = web3.eth.abi.decodeLog([{
                                                                type: 'address',
                                                                name: 'from',
                                                                indexed: true
                                                            },{
                                                                type: 'address',
                                                                name: 'to',
                                                                indexed: true
                                                            },{
                                                                type: 'uint256',
                                                                name: 'value'
                                                            }], log.data, [log.topics[1], log.topics[2], log.topics[3]])
                                                            break
                                                        }catch(e){}
                                                    }
                                                }

                                                if(decodedLog == null) break

                                                transaction.swapInfos.amountOut = decodedLog.value
                                                break

                                            case 'swapTokensForExactETH':
                                            case 'swapTokensForExactTokens':
                                            case 'swapETHForExactTokens':
                                            case 'exactOutput':
                                            case 'exactOutputSingle':
                                                let log2 = receipt.logs[receipt.logs.length-1]

                                                let decodedLog2 = null

                                                for(let nLog of receipt.logs){
                                                    if(nLog.address.toLowerCase() == transaction.swapInfos.tokenIn.toLowerCase()){
                                                        log2 = nLog
                                                        try {
                                                            decodedLog2 = web3.eth.abi.decodeLog([{
                                                                type: 'address',
                                                                name: 'from',
                                                                indexed: true
                                                            },{
                                                                type: 'address',
                                                                name: 'to',
                                                                indexed: true
                                                            },{
                                                                type: 'uint256',
                                                                name: 'value'
                                                            }], log2.data, [log2.topics[1], log2.topics[2], log2.topics[3]])
                                                            break
                                                        }catch(e){}
                                                    }
                                                }

                                                if(decodedLog2 == null) break

                                                transaction.swapInfos.amountIn = decodedLog2.value
                                                break
                                        }
                                    }catch (e) {}

                                }

                            }
                        }

                        transaction.confirmations = blockNumber - receipt.blockNumber
                        transaction.gasUsed = receipt.gasUsed
                        transaction.status = receipt.status

                        baseWallet.save()
                    })
                }
            })
        }
    }

}
