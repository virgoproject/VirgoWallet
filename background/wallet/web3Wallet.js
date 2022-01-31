class Web3Wallet {

    constructor(name, ticker, rpcURL, chainID) {
        this.name = name
        this.ticker = ticker
        this.rpcURL = rpcURL
        this.chainID = chainID
    }

    static fromJSON(json){
        return new Web3Wallet(json.name, json.ticker, json.RPC, json.chainID)
    }

    toJSON(){
        return {
            "type": "web3",
            "wallet": {
                "name": this.name,
                "ticker": this.ticker,
                "RPC": this.rpcURL,
                "chainID": this.chainID
            }
        }
    }

    getAddressesJSON(){
        return web3.currentProvider.addresses
    }

}