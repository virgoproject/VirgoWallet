class Web3Wallet {

    constructor(name, ticker, decimals, rpcURL, chainID) {
        this.name = name
        this.ticker = ticker
        this.decimals = decimals
        this.rpcURL = rpcURL
        this.chainID = chainID

        this.balances = new Map()
    }

    static fromJSON(json){
        return new Web3Wallet(json.name, json.ticker, json.decimals, json.RPC, json.chainID)
    }

    toJSON(){
        return {
            "type": "web3",
            "wallet": {
                "name": this.name,
                "ticker": this.ticker,
                "decimals": this.decimals,
                "RPC": this.rpcURL,
                "chainID": this.chainID
            }
        }
    }

    getAddressesJSON(){
        const json = []

        for(const address of baseWallet.getAddresses()){
            let balance = this.balances.get(address)
            if(balance === undefined) balance = 0
            json.push({
                "address": address,
                "balance": balance
            })
        }

        return json
    }

    update(){
        console.log("updating " + this.name + " wallet")
        const wallet = this

        //updating balances
        for(const address of baseWallet.getAddresses()){
            web3.eth.getBalance(address).then(function(res){
                wallet.balances.set(address, res)
            })
        }
    }

}