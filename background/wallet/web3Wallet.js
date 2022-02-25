class Web3Wallet {

    constructor(name, asset, ticker, decimals, contract, rpcURL, chainID, tokens) {
        this.name = name
        this.asset = asset
        this.ticker = ticker
        this.decimals = decimals
        this.contract = contract
        this.rpcURL = rpcURL
        this.chainID = chainID
        this.tokens = tokens

        this.balances = new Map()

        const wallet = this
        fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/" + ticker + "/infos.json")
            .then(function(resp){
                resp.json().then(function(res){
                    wallet.CG_Platform = res.CG_Platform
                })
            })
    }

    static fromJSON(json){
        return new Web3Wallet(json.name, json.asset, json.ticker, json.decimals, json.contract, json.RPC, json.chainID, json.tokens)
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
                "tokens": this.tokens
            }
        }
    }

    getAddressesJSON(){
        const json = []

        for(const address of baseWallet.getAddresses()){
            let balances = this.getBalances(address)
            json.push({
                "address": address,
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
                "balance": 0,
                "price": 0
            }

            for(const token of this.tokens){
                balances[token.contract] = {
                    "name": token.name,
                    "ticker": token.ticker,
                    "decimals": token.decimals,
                    "contract": token.contract,
                    "balance": 0,
                    "price": 0
                }
            }
        }


        this.balances.set(address, balances)

        return balances
    }

    update(){
        console.log("updating " + this.name + " wallet")
        const wallet = this

        //update balances
        for(const address of baseWallet.getAddresses()){

            let balances = this.getBalances(address)

            //updating main asset balances
            web3.eth.getBalance(address).then(function(res){
                balances[wallet.ticker].balance = res;
            })

            //update tokens balances
            for(const token of this.tokens){
                const contract = new web3.eth.Contract(ERC20_ABI, token.contract, { from: address});
                contract.methods.balanceOf(address).call()
                    .then(function(res){
                        balances[token.contract].balance = res
                    })
            }

        }
    }

    updatePrices(){
        //not optimised, better to fetch prices for all addresses at once
        for(const address of baseWallet.getAddresses()) {
            if (this.CG_Platform)
                Object.entries(this.balances.get(address)).map(([contractAddr, balance]) => {
                    fetch("https://api.coingecko.com/api/v3/simple/token_price/" + this.CG_Platform + "?contract_addresses=" + balance.contract.toLowerCase() + "&vs_currencies=usd")
                        .then(function (resp) {
                            resp.json().then(function (res) {
                                balance.price = parseFloat(res[balance.contract.toLowerCase()].usd)
                            })
                        }).catch(function (e) {
                    })
                })
        }
    }

    hasToken(contract){
        for(const token of this.tokens)
            if(token.contract == contract) return true

        return false
    }

    addToken(name, ticker, decimals, contract){
        if(this.hasToken(contract) || !web3.utils.isAddress(contract)) return;

        const token = {
            "name": name,
            "ticker": ticker,
            "decimals": decimals,
            "contract": contract
        }

        this.tokens.push(token)

        for(const address of baseWallet.getAddresses()) {
            let balances = this.getBalances(address)
            balances[token.contract] = {
                "name": token.name,
                "ticker": token.ticker,
                "decimals": token.decimals,
                "contract": token.contract,
                "balance": 0,
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
                baseWallet.save()
                return;
            }
            i++
        }


    }

}