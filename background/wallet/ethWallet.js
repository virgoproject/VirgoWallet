class EthWallet {

    constructor(name, asset, ticker, decimals, contract, rpcURL, chainID, tokens, transactions, explorer, swapV2Params, testnet, atomicSwapParams, nft, tracked) {
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
        this.atomicSwapParams = atomicSwapParams
        this.tracked = tracked
        this.swapV2Params = swapV2Params

        this.balances = new Map()
        this.prices = new Map()

        this.tokenSet = new Map()
        this.nftSet = new Map()

        for (let nft of this.nft)
            this.nftSet.set(nft.contract, nft)

        for(let token of this.tokens)
            this.tokenSet.set(token.contract, token)

        for(let transaction of this.transactions)
            if(transaction.contractAddr == "ATOMICSWAP")
                atomicSwap.addOrder(transaction.swapInfos)

        const wallet = this

        if(this.chainID == 204 || this.chainID == 8453 || this.chainID == 10 || this.chainID == 42220 || this.chainID == 42161){
            if(this.tokenSet.has("0x7420B4b9a0110cdC71fB720908340C03F9Bc03EC") || this.tokenSet.has("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c")){
                this.tokens = []
                this.tokenSet = new Map()
            }
        }

        try {
            fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/" + chainID + "/infos.json")
                .then(function(resp){
                    try {
                        resp.json().then(function(res){
                            console.log(res)
                            wallet.CG_Platform = res.CG_Platform
                            for(let token of res.tokens){
                                try {
                                    if(!wallet.hasToken(token)){
                                        fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/" + chainID + "/" + token + "/infos.json")
                                            .then(function(resp2){
                                                console.log("adding " + chainID + " " + token)
                                                resp2.json().then(function(res2){
                                                    console.log("added " + res2.ticker)
                                                    wallet.addToken(res2.name, res2.ticker, res2.decimals, res2.contract, false)
                                                })
                                            })
                                    }
                                }catch(e){
                                    console.log(e)
                                }
                            }
                        }).catch(e => {
                            console.log(e)
                            console.log("ssss")
                        })
                    }catch(e){
                        console.log(e)
                    }
                })
        }catch(e){
            console.log(e)
        }
    }

    static fromJSON(json){
        if(json.swapV2Params === undefined) json.swapV2Params = false
        if(json.tracked === undefined) json.tracked = true
        if(json.transactions === undefined) json.transactions = []
        if (json.nft === undefined) json.nft = []
        if(json.explorer === undefined){
            switch(json.chainID){
                case 1:
                    json.explorer = "https://etherscan.io/tx/"
                    break
                case 3:
                    json.explorer = "https://ropsten.etherscan.io/tx/"
                    break
                case 56:
                    json.explorer = "https://bscscan.com/tx/"
                    break
                case 137:
                    json.explorer = "https://polygonscan.com/tx/"
                    break
            }
        }
        switch(json.chainID){
            case 1:
                json.atomicSwapParams = {
                    lockerAddress: "0x07AF5E2075BB32FfdFF5Ac2Ffb492bdE5D98D65b",
                    orders: []
                }
                break
            case 137:
                json.atomicSwapParams = {
                    lockerAddress: "0xf91E9e5C955c0d19b435a8Bf526b8365a8E4eDf0",
                    orders: []
                }
                break
            case 56:
                json.atomicSwapParams = {
                    lockerAddress: "0xFE8919beCDbC0A2d7BdEB03981f90B26C2DAc200",
                    orders: []
                }
                break
            case 500:
                json.RPC = "https://mainnet-rpc.hyperonscan.com/"
                json.explorer = "https://hyperonscan.com/tx/"
                break
            default:
                json.atomicSwapParams = false
        }

        if(json.chainID == 1)
            json.RPC = "https://rpc.ankr.com/eth"

        if(json.chainID == 3){
            json.name = "Goerli"
            json.chainID = 5
            json.ticker = "GETH"
            json.RPC = "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
            json.explorer = "https://goerli.etherscan.io/tx/"
            json.testnet = true
        }
        if(json.chainID == 400)
            json.testnet = true

        if(json.chainID == 128)
            json.RPC = "https://http-mainnet.hecochain.com/"

        if(json.chainID == 61)
            json.RPC = "https://www.ethercluster.com/etc"

        if(json.chainID == 137)
            json.RPC = "https://rpc.ankr.com/polygon"

        return new EthWallet(json.name, json.asset, json.ticker, json.decimals, json.contract, json.RPC, json.chainID, json.tokens, json.transactions, json.explorer, json.swapV2Params, json.testnet, json.atomicSwapParams, json.nft, json.tracked)
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
                "name": this.getAccountName(address),
                "balances": balances
            })
        }
        return json
    }

    getAccountName(address){
        let name = accName[address]

        if (name === undefined || name === ""){
            name = "Account "+baseWallet.getAddresses().indexOf(address)
            accName[address] = name
            browser.storage.local.set({"accountsNames": accName});
        }

        return name
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
                "change": 0
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

    //TODO: Refactor everything so it clearer
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
                if(balances[wallet.ticker].balance < res && !first){
                    browser.notifications.create("txNotification", {
                        "type": "basic",
                        "title": "Money in!",
                        "iconUrl": browser.runtime.getURL("/ui/images/walletLogo.png"),
                        "message": "Received " + (res-balances[wallet.ticker].balance)/10**wallet.decimals + " " + wallet.ticker + " on " + address
                    });
                }

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
                        if(balances[token.contract].balance < res && !first){
                            browser.notifications.create("txNotification", {
                                "type": "basic",
                                "title": "Money in!",
                                "iconUrl": browser.runtime.getURL("/ui/images/walletLogo.png"),
                                "message": "Received " + (res-balances[token.contract].balance)/10**token.decimals + " " + token.ticker + " on " + address
                            });
                        }
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
                    if(transaction.confirmations !== undefined && transaction.confirmations >= 12 || transaction.status == false || transaction.contractAddr == "ATOMICSWAP") continue

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

                        if(transaction.status === undefined){
                            if(receipt.status){

                                if(transaction.contractAddr == "SWAP"){

                                    _this.initSwapUtils()
                                    await _this.swapUtils.updateTransactionStatus(transaction, receipt)

                                } else if(transaction.contractAddr == "WEB3_SWAP"){

                                    try {
                                        console.log(transaction.swap.type)

                                        switch (transaction.swap.type){
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
                                                    if(nLog.address.toLowerCase() == transaction.swap.tokenOut.toLowerCase()){
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

                                                transaction.swap.amountOut = decodedLog.value
                                                break

                                            case 'swapTokensForExactETH':
                                            case 'swapTokensForExactTokens':
                                            case 'swapETHForExactTokens':
                                            case 'exactOutput':
                                            case 'exactOutputSingle':
                                                let log2 = receipt.logs[receipt.logs.length-1]

                                                let decodedLog2 = null

                                                for(let nLog of receipt.logs){
                                                    if(nLog.address.toLowerCase() == transaction.swap.tokenIn.toLowerCase()){
                                                        console.log(nLog.address + " " + transaction.swap.tokenIn)
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

                                                transaction.swap.amountIn = decodedLog2.value
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

    updatePrices(){
        console.log("updating prices")
        const _this = this
        if (!this.CG_Platform) return
        //not optimised, better to fetch prices for all addresses at once
            for(const token of this.tokens){
                if(!token.tracked && token.contract.toLowerCase() != this.contract.toLowerCase()) continue
                console.log("updating price for " + token.contract)
                console.log(selectedCurrency)
                fetch("https://api.coingecko.com/api/v3/simple/token_price/" + this.CG_Platform + "?contract_addresses=" + token.contract.toLowerCase() + "&vs_currencies="+ selectedCurrency +"&include_24hr_change=true")
                    .then(function (resp) {
                        resp.json().then(function (res) {
                            console.log(res)
                            const price = {
                                price: parseFloat(res[token.contract.toLowerCase()][selectedCurrency]),
                                change: parseFloat(res[token.contract.toLowerCase()][selectedCurrency+"_24h_change"])
                            }
                            _this.prices.set(token.contract, price)
                        })
                    }).catch(function (e) {
                    console.log(e)
                })
            }
    }

    hasToken(contract){
        return this.tokenSet.has(contract)
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

    addNft(tokenURI,tokenId,owner, contractNft,collec, track = true){
        if(this.hasToken(contractNft) || !web3.utils.isAddress(contractNft)) return;

        console.log(collec)
        const token = {
            "tokenUri": tokenURI,
            "tokenId": tokenId,
            "collection": collec,
            "contract": contractNft,
            "owner": owner,
            "track": track
        }

        console.log(token)
        this.nft.push(token)
        this.nftSet.set(token.contract, token)
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

    initSwapUtils(){
        if(this.swapUtils === undefined)
            this.swapUtils = new EthSwapUtils(this.chainID, this.swapV2Params)
    }

    async getSwapRoute(amount, token1, token2){
        this.initSwapUtils()

        return await this.swapUtils.getSwapRoute(amount, token1, token2)
    }

    async estimateSwapFees(amount, quote){
        this.initSwapUtils()

        return await this.swapUtils.estimateSwapFees(amount, quote)
    }

    async initSwap(amount, quote, gasPrice){
        this.initSwapUtils()

        return await this.swapUtils.initSwap(amount, quote, gasPrice)
    }

}
