class EthWallet {

    constructor(baseWalletInst, name, asset, ticker, decimals, contract, rpcURL, chainID, tokens, transactions, explorer, swapV2Params, testnet, nft, tracked) {
        this.name = name
        this.asset = asset
        this.ticker = ticker
        this.decimals = decimals
        this.contract = contract
        this.rpcURL = rpcURL
        this.chainID = chainID
        this.tokens = tokens
        this.nft = nft
        this.transactions = transactions
        this.explorer = explorer
        this.testnet = testnet
        this.atomicSwapParams = false
        this.tracked = tracked
        this.swapV2Params = swapV2Params

        this.balances = new Map()
        this.prices = new Map()

        this.tokenSet = new Map()
        this.nftSet = new Map()

        for (let nft of this.nft)
            this.nftSet.set(nft.contract+nft.tokenId, nft)

        for(let token of this.tokens)
            this.tokenSet.set(token.contract, token)

        for(let transaction of this.transactions)
            if(transaction.contractAddr == "ATOMICSWAP")
                atomicSwap.addOrder(transaction.swapInfos)

        this.initProvider()

        new EthWalletUpdater(this, baseWalletInst)
    }

    static fromJSON(json, baseWalletInst){
        if(json.swapV2Params === undefined) json.swapV2Params = false
        if(json.tracked === undefined) json.tracked = true
        if(json.transactions === undefined) json.transactions = []
        if (json.nft === undefined) json.nft = []

        return new EthWallet(baseWalletInst, json.name, json.asset, json.ticker, json.decimals, json.contract, json.RPC, json.chainID, json.tokens, json.transactions, json.explorer, json.swapV2Params, json.testnet, json.nft, json.tracked)
    }

    toJSON(){
        return {
            "type": "web3",
            "wallet": {
                "name": this.name,
                "asset": this.asset,
                "ticker": this.ticker,
                "decimals": this.decimals,
                "contract": this.contract,
                "RPC": this.rpcURL,
                "chainID": this.chainID,
                "tokens": this.tokens,
                "nft":  this.nft,
                "transactions": this.transactions,
                "explorer": this.explorer,
                "swapV2Params": this.swapV2Params,
                "testnet": this.testnet,
                "atomicSwapParams": this.atomicSwapParams,
                "tracked": this.tracked,
            }
        }
    }

    getAddressesJSON(){
        const json = []

        for(const address of baseWallet.getAddresses()){
            let balances = this.getBalances(address)
            json.push({
                "address": address,
                "name": baseWallet.getAccountName(address),
                "balances": balances
            })
        }
        return json
    }

    getCurrentAddress(){
        return this.getAddresses()[baseWallet.selectedAddress]
    }

    getAddresses(){
        const addrs = []

        for(let i = 0; i < this.web3.eth.accounts.wallet.length; i++){
            addrs.push(this.web3.eth.accounts.wallet[i].address)
        }

        return addrs
    }

    getBalances(address){
        let balances = this.balances.get(address)
        if(balances === undefined){
            balances = {}
            balances[this.ticker] = {
                "name": this.asset,
                "ticker": this.ticker,
                "decimals": this.decimals,
                "contract": this.contract,
                "tracked": true,
                "balance": 0,
                "price": 0,
                "change": 0,
                "isNative": true
            }

            for(const token of this.tokens){
                balances[token.contract] = {
                    "name": token.name,
                    "ticker": token.ticker,
                    "decimals": token.decimals,
                    "contract": token.contract,
                    "tracked": token.tracked,
                    "balance": 0,
                    "price": 0,
                    "change": 0
                }
            }

            this.balances.set(address, balances)

        }

        for(const token of this.tokens){
            const price = this.prices.get(token.contract)
            if(price === undefined) continue
            balances[token.contract].change = price.change
            balances[token.contract].price = price.price
            if(token.contract.toLowerCase() == this.contract.toLowerCase()){
                balances[this.ticker].change = price.change
                balances[this.ticker].price = price.price
            }
        }

        return balances
    }

    //TODO: Refactor everything so its clearer
    update(first = false){
        console.log("updating " + this.name + " wallet")
        const wallet = this

        let updateCount = 0
        const updateTarget = (this.tokens.length+1)*baseWallet.getAddresses().length

        const _this = this

        //update balances
        for(const address of baseWallet.getAddresses()){

            let balances = this.getBalances(address)

            //updating main asset balances
            web3.eth.getBalance(address).then(function(res){
                balances[wallet.ticker].balance = res;
                if(first){
                    updateCount++
                    console.log(updateCount + "/" + updateTarget)
                    if (updateCount >= updateTarget)
                        wallet.updatePrices()
                }
            })

            //update tokens balances
            for(const token of this.tokens){
                if(!token.tracked){
                    if(first)
                        updateCount++
                    continue
                }

                const contract = new web3.eth.Contract(ERC20_ABI, token.contract, { from: address});
                contract.methods.balanceOf(address).call()
                    .then(function(res){
                        balances[token.contract].balance = res
                        if(first) {
                            updateCount++
                            console.log(updateCount + "/" + updateTarget)
                            if (updateCount >= updateTarget)
                                wallet.updatePrices()
                        }
                    })
            }

        }

        if(this.transactions.length > 0){
            web3.eth.getBlockNumber().then(function(blockNumber){
                for(const transaction of wallet.transactions){
                    if((transaction.confirmations !== undefined && transaction.confirmations >= 12 || transaction.status == false || transaction.contractAddr == "ATOMICSWAP") && !(transaction.contractAddr == "SWAP" && transaction.swapInfos.amountOut == undefined)) continue

                    web3.eth.getTransactionReceipt(transaction.hash).then(async function(receipt){
                        if(receipt == null){
                            if(transaction.canceling){
                                transaction.status = false
                                transaction.gasUsed = 21000
                                transaction.gasPrice = transaction.cancelingPrice
                                baseWallet.save()
                                browser.notifications.create("txNotification", {
                                    "type": "basic",
                                    "title": "Transaction canceled!",
                                    "iconUrl": browser.runtime.getURL("/ui/images/walletLogo.png"),
                                    "message": "Transaction " + transaction.hash + " successfully canceled"
                                });
                            }
                            return
                        }

                        if(transaction.status === undefined || (transaction.contractAddr == "SWAP" && transaction.swapInfos.amountOut == undefined)){
                            if(receipt.status){

                                if(transaction.contractAddr == "SWAP"){

                                    _this.initSwapUtils()
                                    await _this.swapUtils.updateTransactionStatus(transaction, receipt)

                                } else if(transaction.contractAddr == "WEB3_SWAP"){

                                    try {
                                        console.log(transaction.swapInfos.type)

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
                                                            console.log(log)

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

                                                if(decodedLog == null){
                                                    console.log("no good log")
                                                    break
                                                }

                                                console.log(decodedLog)
                                                console.log("amountOut: " + decodedLog.value)

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
                                                        console.log(nLog.address + " " + transaction.swapInfos.tokenIn)
                                                        log2 = nLog
                                                        try {
                                                            console.log(log2)

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

                                                if(decodedLog2 == null){
                                                    console.log("no good log")
                                                    break
                                                }

                                                console.log(decodedLog2)
                                                console.log("amountIn: " + decodedLog2.value)

                                                transaction.swapInfos.amountIn = decodedLog2.value
                                                break
                                        }
                                    }catch (e) {
                                        console.log(e)
                                    }

                                    browser.notifications.create("txNotification", {
                                        "type": "basic",
                                        "title": "Swap successful!",
                                        "iconUrl": browser.runtime.getURL("/ui/images/walletLogo.png"),
                                        "message": "Transaction " + transaction.hash + " confirmed"
                                    })

                                } else {
                                    browser.notifications.create("txNotification", {
                                        "type": "basic",
                                        "title": "Transaction confirmed!",
                                        "iconUrl": browser.runtime.getURL("/ui/images/walletLogo.png"),
                                        "message": "Transaction " + transaction.hash + " confirmed"
                                    })
                                }

                            }else if(receipt.status == false){
                                if(transaction.contractAddr == "SWAP")
                                    browser.notifications.create("txNotification", {
                                        "type": "basic",
                                        "title": "Swap failed.",
                                        "iconUrl": browser.runtime.getURL("/ui/images/walletLogo.png"),
                                        "message": "Transaction " + transaction.hash + " failed"
                                    })
                                else
                                    browser.notifications.create("txNotification", {
                                        "type": "basic",
                                        "title": "Transaction failed.",
                                        "iconUrl": browser.runtime.getURL("/ui/images/walletLogo.png"),
                                        "message": "Transaction " + transaction.hash + " failed"
                                    })
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

    hasToken(contract){
        contract = web3.utils.toChecksumAddress(contract)
        return this.tokenSet.has(contract) || this.tokenSet.has(contract.toLowerCase())
    }

    getToken(contract){
        contract = web3.utils.toChecksumAddress(contract)
        if(this.tokenSet.has(contract)) return this.tokenSet.get(contract)
        if(this.tokenSet.has(contract.toLowerCase())) return this.tokenSet.get(contract.toLowerCase())
    }

    addToken(name, ticker, decimals, contract, track = true){
        if(this.hasToken(contract) || !web3.utils.isAddress(contract)) return;

        const token = {
            "name": name,
            "ticker": ticker,
            "decimals": decimals,
            "contract": contract,
            "tracked": track
        }

        this.tokens.push(token)
        this.tokenSet.set(token.contract, token)

        for(const address of baseWallet.getAddresses()) {
            let balances = this.getBalances(address)
            balances[token.contract] = {
                "name": token.name,
                "ticker": token.ticker,
                "decimals": token.decimals,
                "contract": token.contract,
                "tracked": track,
                "balance": 0,
                "price": 0,
                "change": 0
            }
        }

        baseWallet.save()

    }

    addNft(tokenURI, tokenId, owner, contract, collection, track = true){
        if(this.nftSet.has(contract+tokenId)) return 0
        if (baseWallet.getCurrentAddress().toLowerCase() !== owner.toLowerCase()) return 1

        const token = {
            "tokenUri": tokenURI,
            "tokenId": tokenId,
            "collection": collection,
            "contract": contract,
            "owner": owner,
            "track": track
        }

        this.nft.push(token)
        this.nftSet.set(token.contract+token.tokenId, token)
        baseWallet.save()
        return 2
    }

    removeNft(contract, tokenId){
        let i = 0;
        for(const nft of this.nft){
            if(nft.contract.toLowerCase() == contract.toLowerCase()){
                if (nft.tokenId == tokenId) {
                    this.nft.splice(i, 1)
                    this.nftSet.delete(nft.contract+nft.tokenId)
                    baseWallet.save()
                    return
                }
            }
            i++
        }
    }

    removeToken(contract){
        let i = 0;
        for(const token of this.tokens){
            if(token.contract == contract){
                this.tokens.splice(i,1)
                for(const address of baseWallet.getAddresses()) {
                    let balances = this.getBalances(address)
                    delete balances[token.contract]
                }
                this.tokenSet.delete(token.contract)
                baseWallet.save()
                return;
            }
            i++
        }
    }

    changeTracking(contract, setToTrue = false){
        for(const token of this.tokens){
            if(token.contract == contract){
                let newState = !token.tracked
                if(setToTrue)
                    newState = true
                token.tracked = newState
                for(const address of baseWallet.getAddresses()) {
                    let balances = this.getBalances(address)
                    balances[token.contract].tracked = newState
                }
                baseWallet.save()
                return;
            }
        }
    }

    getTransaction(hash){
        return this.transactions.find(tx => tx.hash === hash)
    }

    swap(){
        if(this.swapUtils === undefined)
            this.swapUtils = new EthSwapUtils(this)

        return this.swapUtils
    }

    initProvider(){
        this.web3 = new Web3(this.rpcURL)

        for(const pKey of baseWallet.privateKeys){
            if(pKey.hidden) continue
            const acc = this.web3.eth.accounts.privateKeyToAccount(pKey.privateKey)
            this.web3.eth.accounts.wallet.add(acc)
        }
    }

}
