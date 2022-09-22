class Web3Wallet {

    constructor(name, asset, ticker, decimals, contract, rpcURL, chainID, tokens, transactions, explorer) {
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

        this.balances = new Map()

        this.tokenSet = new Map()

        for(let token of this.tokens)
            this.tokenSet.set(token.contract, true)

        const wallet = this
        fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/" + ticker + "/infos.json")
            .then(function(resp){
                resp.json().then(function(res){
                    wallet.CG_Platform = res.CG_Platform
                    for(let token of res.tokens){
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
        return new Web3Wallet(json.name, json.asset, json.ticker, json.decimals, json.contract, json.RPC, json.chainID, json.tokens, json.transactions, json.explorer)
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
                "explorer": this.explorer
            }
        }
    }

    getAddressesJSON(){
        const json = []

        for(const address of baseWallet.getAddresses()){
            let balances = this.getBalances(address)
            json.push({
                "address": address,
                "name": accName[address],
                "balances": balances
            })
        }

        return json
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
                "change": 0,
                "price": 0
            }

            for(const token of this.tokens){
                balances[token.contract] = {
                    "name": token.name,
                    "ticker": token.ticker,
                    "decimals": token.decimals,
                    "contract": token.contract,
                    "tracked": token.tracked,
                    "balance": 0,
                    "change": 0,
                    "price": 0
                }
            }
        }


        this.balances.set(address, balances)

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
                                browser.notifications.create("txNotification", {
                                    "type": "basic",
                                    "title": "Transaction confirmed!",
                                    "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
                                    "message": "Transaction " + transaction.hash + " confirmed"
                                });
                            }else if(receipt.status == false){
                                browser.notifications.create("txNotification", {
                                    "type": "basic",
                                    "title": "Transaction failed.",
                                    "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
                                    "message": "Transaction " + transaction.hash + " failed"
                                });
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
        //not optimised, better to fetch prices for all addresses at once
        for(const address of baseWallet.getAddresses()) {
            if (this.CG_Platform)
                Object.entries(this.balances.get(address)).map(([contractAddr, balance]) => {
                    if(!balance.tracked) return;
                    fetch("https://api.coingecko.com/api/v3/simple/token_price/" + this.CG_Platform + "?contract_addresses=" + balance.contract.toLowerCase() + "&vs_currencies=usd&include_24hr_change=true")
                        .then(function (resp) {
                            resp.json().then(function (res) {
                                balance.price = parseFloat(res[balance.contract.toLowerCase()].usd)
                                balance.change = parseFloat(res[balance.contract.toLowerCase()].usd_24h_change)
                            })
                        }).catch(function (e) {
                    })
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
                "change": 0,
                "price": 0
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
                this.tokenSet.remove(token.contract)
                baseWallet.save()
                return;
            }
            i++
        }
    }

    changeTracking(contract){
        for(const token of this.tokens){
            if(token.contract == contract){
                const newState = !token.tracked
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

}
