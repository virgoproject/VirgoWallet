class EthWallet {

    constructor(baseWalletInst, name, asset, ticker, decimals, contract, rpcURL, chainID, tokens, transactions, explorer, swapV2Params, testnet, nft, tracked, official) {
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
        this.official = official
        this.swapV2Params = swapV2Params
        this.baseWalletInst = baseWalletInst

        this.balances = new Map()
        this.prices = new Map()

        this.tokenSet = new Map()
        this.nftSet = new Map()

        for (let nft of this.nft)
            this.nftSet.set(nft.contract+nft.tokenId, nft)

        for(let token of this.tokens){
            if(token.autotrack === undefined) token.autotrack = true
            this.tokenSet.set(token.contract, token)
        }

        for(let transaction of this.transactions)
            if(transaction.contractAddr == "ATOMICSWAP")
                atomicSwap.addOrder(transaction.swapInfos)

    }

    init(){
        this.initProvider()
        this.updater = new EthWalletUpdater(this)
    }

    static fromJSON(json, baseWalletInst){
        if(json.swapV2Params === undefined) json.swapV2Params = false
        if(json.tracked === undefined) json.tracked = true
        if(json.transactions === undefined) json.transactions = []
        if (json.nft === undefined) json.nft = []
        if(json.official === undefined) json.official = false

        if(json.chainID == 137 || json.chainID == "137") json.ticker = "POL"

        return new EthWallet(baseWalletInst, json.name, json.asset, json.ticker, json.decimals, json.contract, json.RPC, json.chainID, json.tokens, json.transactions, json.explorer, json.swapV2Params, json.testnet, json.nft, json.tracked, json.official)
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
                "official": this.official
            }
        }
    }

    getAddressesJSON(){
        const json = []

        for(const address of this.getAddresses()){
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
        try {
            return this.getAddresses()[baseWallet.selectedAddress]
        }catch(e){
            console.log(this.name + ": Failed to get current address")
        }
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
                "autotrack": true,
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
                    "autotrack": token.autotrack,
                    "balance": 0,
                    "price": 0,
                    "change": 0
                }
            }

            this.balances.set(address, balances)

        }

        for(const token of this.tokens){
            const price = this.prices.get(token.contract.toLowerCase())
            if(price === undefined) continue
            balances[token.contract].change = price.change
            balances[token.contract].price = price.price
            if(token.contract.toLowerCase() == this.contract.toLowerCase()){
                balances[this.ticker].change = price.change
                balances[this.ticker].price = price.price
            }
        }

        const nativePrice = this.prices.get(this.ticker)
        if(nativePrice){
            balances[this.ticker].change = nativePrice.change
            balances[this.ticker].price = nativePrice.price
        }

        return balances
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
            "tracked": track,
            "autotrack": true
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
                "autotrack": true,
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
                token.autotrack = newState
                for(const address of baseWallet.getAddresses()) {
                    let balances = this.getBalances(address)
                    balances[token.contract].tracked = newState
                    balances[token.contract].autotrack = newState
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

        for(const pKey of this.baseWalletInst.privateKeys){
            if(pKey.hidden) continue
            const acc = this.web3.eth.accounts.privateKeyToAccount(pKey.privateKey)
            this.web3.eth.accounts.wallet.add(acc)
        }
    }

}
