class Web3Wallet {

    constructor(name, asset, ticker, decimals, contract, rpcURL, chainID, tokens, transactions, explorer, swapParams, testnet) {
        this.name = name
        this.asset = asset
        this.ticker = ticker
        this.decimals = decimals
        this.contract = contract
        this.rpcURL = rpcURL
        this.chainID = chainID
        this.tokens = tokens
        this.transactions = transactions
        this.explorer = explorer
        this.swapParams = swapParams
        this.testnet = testnet

        this.balances = new Map()
        this.prices = new Map()

        this.tokenSet = new Map()

        for(let token of this.tokens)
            this.tokenSet.set(token.contract, token)

        const wallet = this
        try {
            fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/" + ticker + "/infos.json")
                .then(function(resp){
                    resp.json().then(function(res){
                        wallet.CG_Platform = res.CG_Platform
                        for(let token of res.tokens){
                            console.log(token)
                            if(!wallet.hasToken(token)){
                                fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/" + ticker + "/" + token + "/infos.json")
                                    .then(function(resp2){
                                        resp2.json().then(function(res2){
                                            wallet.addToken(res2.name, res2.ticker, res2.decimals, res2.contract, false)
                                        })
                                    })
                            }
                        }
                    })
                })
        }catch(e){}
    }

    static fromJSON(json){
        if(json.transactions === undefined) json.transactions = []
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
                json.swapParams = {
                    "type": "uni3",
                    "quoterAddress": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
                    "factoryAddress": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
                    "popularTokens": ["0xdAC17F958D2ee523a2206206994597C13D831ec7","0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","0x6B175474E89094C44Da98b954EedeAC495271d0F"],
                    "proxyAddress": "0x5366De6176049C58F53Cb385A09E52Ae51909b13"
                }
                break
            case 137:
                json.swapParams = {
                    "type": "uni3",
                    "quoterAddress": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
                    "factoryAddress": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
                    "popularTokens": ["0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619","0xc2132D05D31c914a87C6611C10748AEb04B58e8F","0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174","0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"],
                    "proxyAddress": "0x4BF804F200125E1bE6732Cf9fD4a75E60Cc8DEb4"
                }
                break
            case 56:
                json.swapParams = {
                    type: "uni2",
                    routerAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
                    factoryAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
                    popularTokens: ["0x2170Ed0880ac9A755fd29B2688956BD959F933F8","0x55d398326f99059fF775485246999027B3197955","0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d","0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"],
                    proxyAddress: "0x230ad23490f55A1167bc6CB59B6A186e1ebA3703",
                    feesRate: 0.0025
                }
                break
            default:
                json.swapParams = false
        }

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

        return new Web3Wallet(json.name, json.asset, json.ticker, json.decimals, json.contract, json.RPC, json.chainID, json.tokens, json.transactions, json.explorer, json.swapParams, json.testnet)
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
                "transactions": this.transactions,
                "explorer": this.explorer,
                "swapParams": this.swapParams,
                "testnet": this.testnet
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

    update(first = false){
        console.log("updating " + this.name + " wallet")
        const wallet = this

        let updateCount = 0
        const updateTarget = (this.tokens.length+1)*baseWallet.getAddresses().length

        //update balances
        for(const address of baseWallet.getAddresses()){

            let balances = this.getBalances(address)

            //updating main asset balances
            web3.eth.getBalance(address).then(function(res){
                if(balances[wallet.ticker].balance < res && !first){
                    browser.notifications.create("txNotification", {
                        "type": "basic",
                        "title": "Money in!",
                        "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
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
                                "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
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
                    if(transaction.confirmations !== undefined && transaction.confirmations >= 12 || transaction.status == false) continue

                    web3.eth.getTransactionReceipt(transaction.hash).then(function(receipt){
                        if(receipt == null){
                            if(transaction.canceling){
                                transaction.status = false
                                transaction.gasUsed = 21000
                                transaction.gasPrice = transaction.cancelingPrice
                                baseWallet.save()
                                browser.notifications.create("txNotification", {
                                    "type": "basic",
                                    "title": "Transaction canceled!",
                                    "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
                                    "message": "Transaction " + transaction.hash + " successfully canceled"
                                });
                            }
                            return
                        }

                        if(transaction.status === undefined){
                            if(receipt.status){

                                if(transaction.contractAddr == "SWAP"){
                                    const log = receipt.logs[receipt.logs.length-1]

                                    const decodedLog = web3.eth.abi.decodeLog([
                                        {type: "address", "name": "caller"},
                                        {type: "address", "name": "from"},
                                        {type: "address", "name": "to"},
                                        {type: "uint256", "name": "amountIn"},
                                        {type: "uint256", "name": "amountOut"}
                                    ], log.data, log.topics)

                                    transaction.swapInfos.amountOut = decodedLog.amountOut

                                    browser.notifications.create("txNotification", {
                                        "type": "basic",
                                        "title": "Swap successful!",
                                        "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
                                        "message": "Transaction " + transaction.hash + " confirmed"
                                    })

                                }else{
                                    browser.notifications.create("txNotification", {
                                        "type": "basic",
                                        "title": "Transaction confirmed!",
                                        "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
                                        "message": "Transaction " + transaction.hash + " confirmed"
                                    })
                                }

                            }else if(receipt.status == false){
                                if(transaction.contractAddr == "SWAP")
                                    browser.notifications.create("txNotification", {
                                        "type": "basic",
                                        "title": "Swap failed.",
                                        "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
                                        "message": "Transaction " + transaction.hash + " failed"
                                    })
                                else
                                    browser.notifications.create("txNotification", {
                                        "type": "basic",
                                        "title": "Transaction failed.",
                                        "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
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
            fetch("https://api.coingecko.com/api/v3/simple/token_price/" + this.CG_Platform + "?contract_addresses=" + token.contract.toLowerCase() + "&vs_currencies=usd&include_24hr_change=true")
                .then(function (resp) {
                    resp.json().then(function (res) {
                        const price = {
                            price: parseFloat(res[token.contract.toLowerCase()].usd),
                            change: parseFloat(res[token.contract.toLowerCase()].usd_24h_change)
                        }
                        _this.prices.set(token.contract, price)
                    })
                }).catch(function (e) {

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
        this.tokenSet.set(token.contract, true)

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
            switch(this.chainID){
                case 1:
                case 137:
                    this.swapUtils = new Uniswap03Utils(this.swapParams.proxyAddress, this.swapParams.quoterAddress, this.swapParams.factoryAddress, this.swapParams.popularTokens)
                    return
                case 56:
                    this.swapUtils = new Uniswap02Utils(this.swapParams.proxyAddress, this.swapParams.routerAddress, this.swapParams.factoryAddress, this.swapParams.popularTokens, this.swapParams.feesRate)
                    return
            }
    }

    async getSwapRoute(amount, token1, token2){
        this.initSwapUtils()

        return await this.swapUtils.findRoute(amount, token1, token2)
    }

    async estimateSwapFees(amount, route){
        this.initSwapUtils()

        return await this.swapUtils.estimateSwapFees(amount, route)
    }

    async initSwap(amount, route, gasPrice){
        this.initSwapUtils()

        return await this.swapUtils.initSwap(amount, route, gasPrice)
    }

}
