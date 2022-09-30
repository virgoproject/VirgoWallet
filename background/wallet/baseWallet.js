let provider;
let web3;
let baseWallet;

class BaseWallet {

    constructor(data, encryptedDataKey, encryptedDataKeyIV, dataKey, passwordSalt) {
        this.mnemonic = data.mnemonic
        this.nonce = data.nonce

        this.encryptedDataKey = encryptedDataKey
        this.encryptedDataKeyIV = encryptedDataKeyIV
        this.dataKey = dataKey
        this.passwordSalt = passwordSalt

        this.wallets = []
        for(const wallet of data.wallets){
            switch(wallet.type){
                case "web3":
                    this.wallets.push(Web3Wallet.fromJSON(wallet.wallet))
                    break
            }
        }

        this.checkMissingWallets()

        this.selectedWallet = data.selectedWallet
        this.selectedAddress = data.selectedAddress

        provider = new HDWalletProvider({
            mnemonic: this.mnemonic,
            providerOrUrl: this.wallets[this.selectedWallet].rpcURL,
            chainId: this.wallets[this.selectedWallet].chainID,
            numberOfAddresses: this.nonce
        })

        this.setProvider(provider)

        if(data.version !== undefined)
            this.version = data.version
        else{
            this.version = "first"//To change for VERSION after next update
            this.save()
        }
    }

    startLoop(){
        baseWallet.getCurrentWallet().update(true)
        const timer = setInterval(function(){
            if(baseWallet === undefined){
                clearInterval(timer)
                return
            }
            baseWallet.getCurrentWallet().update()
        }, 2500)

        const priceTimer = setInterval(function(){
            if(baseWallet === undefined){
                clearInterval(priceTimer)
                return
            }
            baseWallet.getCurrentWallet().updatePrices()
        }, 30000)
    }

    static generateWallet(mnemonic){
        const wallets = BaseWallet.getBaseWallets()

        if(mnemonic === undefined)
            mnemonic = bip39.generateMnemonic()

        return new BaseWallet({"mnemonic": mnemonic, "nonce": 1, "wallets": wallets, "selectedWallet": 0, "selectedAddress": 0})
    }

    static fromJSON(json, password){
        try {
            let data, encryptedDataKey, encryptedDataKeyIV, dataKey, passwordSalt

            if (json.encryptedDataKey === undefined) {
                data = json.data;
            }else{
                encryptedDataKey = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.encryptedDataKey))
                encryptedDataKeyIV = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.encryptedDataKeyIV))
                let encryptedData = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.data))
                let encryptedDataIV = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.IV))
                passwordSalt = sjcl.codec.bytes.toBits(Converter.hexToBytes(json.passwordSalt))
                let passwordHash = sjcl.misc.pbkdf2(password, passwordSalt, 10000, 256)
                let cipher = new sjcl.cipher.aes(passwordHash)
                dataKey = sjcl.mode.ctr.decrypt(cipher, encryptedDataKey, encryptedDataKeyIV)

                cipher = new sjcl.cipher.aes(dataKey)
                data = JSON.parse(Converter.utf8ArrayToStr(sjcl.codec.bytes.fromBits(sjcl.mode.ctr.decrypt(cipher, encryptedData, encryptedDataIV))))
            }

            return new BaseWallet(data, encryptedDataKey, encryptedDataKeyIV, dataKey, passwordSalt)
        }catch(e){
            console.log(e)
            return false
        }
    }

    static getBaseWallets(){
        const wallets = []

        wallets[0] = {
            "type": "web3",
            "wallet": {
                "name": "Ethereum",
                "asset": "Ethereum",
                "ticker": "ETH",
                "decimals": 18,
                "contract": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "RPC": "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
                "chainID": 1,
                "tokens": [],
                "transactions": [],
                "explorer": "https://etherscan.io/tx/",
                "swapParams": {
                    "type": "uni3",
                    "quoterAddress": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
                    "factoryAddress": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
                    "popularTokens": ["0xdAC17F958D2ee523a2206206994597C13D831ec7","0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","0x6B175474E89094C44Da98b954EedeAC495271d0F"],
                    "proxyAddress": ""
                }
            }
        }

        wallets[1] = {
            "type": "web3",
            "wallet": {
                "name": "Ropsten",
                "asset": "Ethereum",
                "ticker": "RETH",
                "decimals": 18,
                "contract": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "RPC": "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
                "chainID": 3,
                "tokens": [],
                "transactions": [],
                "explorer": "https://ropsten.etherscan.io/tx/",
                "testnet": true
            }
        }

        wallets[2] = {
            "type": "web3",
            "wallet": {
                "name": "Smart Chain",
                "asset": "Binance Coin",
                "ticker": "BNB",
                "decimals": 18,
                "contract": "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
                "RPC": "https://bsc-dataseed.binance.org/",
                "chainID": 56,
                "tokens": [
                    {
                        "name": "Virgo",
                        "ticker": "VGO",
                        "decimals": 8,
                        "contract": "0xfb526228ff1c019e4604c7e7988c097d96bd5b70",
                        "tracked": true
                    }
                ],
                "transactions": [],
                "explorer": "https://bscscan.com/tx/",
                "swapParams": {
                    "type": "uni2",
                    "routerAddress": "0x10ED43C718714eb63d5aA57B78B54704E256024E",
                    "factoryAddress": "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
                    "popularTokens": ["0x2170Ed0880ac9A755fd29B2688956BD959F933F8","0x55d398326f99059fF775485246999027B3197955","0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d","0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"],
                    "proxyAddress": "0x230ad23490f55A1167bc6CB59B6A186e1ebA3703"
                }
            }
        }

        wallets[3] = {
            "type": "web3",
            "wallet": {
                "name": "Polygon",
                "asset": "Polygon",
                "ticker": "MATIC",
                "decimals": 18,
                "contract": "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "RPC": "https://polygon-rpc.com",
                "chainID": 137,
                "tokens": [],
                "transactions": [],
                "explorer": "https://polygonscan.com/tx/",
                "swapParams": {
                    "type": "uni3",
                    "quoterAddress": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
                    "factoryAddress": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
                    "popularTokens": ["0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619","0xc2132D05D31c914a87C6611C10748AEb04B58e8F","0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174","0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"],
                    "proxyAddress": "0x4BF804F200125E1bE6732Cf9fD4a75E60Cc8DEb4"
                }
            }
        }

        wallets[4] = {
            "type": "web3",
            "wallet": {
                "name": "Avalanche",
                "asset": "Avalanche",
                "ticker": "AVAX",
                "decimals": 18,
                "contract": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
                "RPC": "https://api.avax.network/ext/bc/C/rpc",
                "chainID": 43114,
                "tokens": [],
                "transactions": [],
                "explorer": "https://snowtrace.io/tx/"
            }
        }

        wallets[5] = {
            "type": "web3",
            "wallet": {
                "name": "Fantom",
                "asset": "Fantom",
                "ticker": "FTM",
                "decimals": 18,
                "contract": "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
                "RPC": "https://rpc.ftm.tools/",
                "chainID": 250,
                "tokens": [],
                "transactions": [],
                "explorer": "https://ftmscan.com/tx/"
            }
        }

        wallets[6] = {
            "type": "web3",
            "wallet": {
                "name": "Heco Chain",
                "asset": "Huobi Token",
                "ticker": "HT",
                "decimals": 18,
                "contract": "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f",
                "RPC": "https://http-mainnet-node.huobichain.com/",
                "chainID": 128,
                "tokens": [],
                "transactions": [],
                "explorer": "https://hecoinfo.com/tx/"
            }
        }

        wallets[7] = {
            "type": "web3",
            "wallet": {
                "name": "KuCoin Chain",
                "asset": "KuCoin Token",
                "ticker": "KCS",
                "decimals": 18,
                "contract": "0x4446fc4eb47f2f6586f9faab68b3498f86c07521",
                "RPC": "https://rpc-mainnet.kcc.network/",
                "chainID": 321,
                "tokens": [],
                "transactions": [],
                "explorer": "https://explorer.kcc.io/en/tx/"
            }
        }

        wallets[8] = {
            "type": "web3",
            "wallet": {
                "name": "Cronos Chain",
                "asset": "Cronos",
                "ticker": "CRO",
                "decimals": 18,
                "contract": "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23",
                "RPC": "https://evm-cronos.crypto.org/",
                "chainID": 25,
                "tokens": [],
                "transactions": [],
                "explorer": "https://cronoscan.com/tx/"
            }
        }

        wallets[9] = {
            "type": "web3",
            "wallet": {
                "name": "Ether PoW",
                "asset": "EthereumPoW",
                "ticker": "ETHW",
                "decimals": 18,
                "contract": "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23",
                "RPC": "https://mainnet.ethereumpow.org/",
                "chainID": 10001,
                "tokens": [],
                "transactions": [],
                "explorer": "https://www.oklink.com/en/ethw/tx/"
            }
        }

        return wallets
    }

    setProvider(provider){
        web3 = new Web3(provider)

        //add wallet objects generated by HDWP to web3
        Object.entries(provider.wallets).map(([key, value]) => web3.eth.accounts.wallet.add(web3.utils.toHex(value.privateKey)))
    }

    //check current wallets against reference list, if some networks are missing add them
    checkMissingWallets(){
        const referenceWallets = BaseWallet.getBaseWallets()

        let changed = false

        b: for(const refWallet of referenceWallets){
            for(const wallet of this.wallets)
                if(refWallet.wallet.chainID == wallet.chainID) continue b

            changed = true
            this.wallets.push(Web3Wallet.fromJSON(refWallet.wallet))
        }

        if(changed) this.save()
    }

    encrypt(password){
        this.passwordSalt = sjcl.random.randomWords(32)
        let passwordHash = sjcl.misc.pbkdf2(password, this.passwordSalt, 10000, 256)
        this.dataKey = sjcl.random.randomWords(8)
        this.encryptedDataKeyIV = sjcl.random.randomWords(4)
        let cipher = new sjcl.cipher.aes(passwordHash)
        this.encryptedDataKey = sjcl.mode.ctr.encrypt(cipher, this.dataKey, this.encryptedDataKeyIV)
        this.save()
    }

    isEncrypted(){
        return this.encryptedDataKey !== undefined;
    }

    passwordMatch(password){
        let passwordHash = sjcl.misc.pbkdf2(password, this.passwordSalt, 10000, 256)
        let cipher = new sjcl.cipher.aes(passwordHash)
        let trialDataKey = sjcl.mode.ctr.decrypt(cipher, this.encryptedDataKey, this.encryptedDataKeyIV)

        return JSON.stringify(this.dataKey) == JSON.stringify(trialDataKey)
    }

    toJSON(){
        let json = {}

        //put wallet data to a JSON object
        let data = {}
        data.nonce = this.nonce
        data.mnemonic = this.mnemonic
        data.version = this.version

        data.wallets = []
        for(const wallet of this.wallets)
            data.wallets.push(wallet.toJSON())

        data.selectedWallet = this.selectedWallet
        data.selectedAddress = this.selectedAddress

        //if no dataKey return in plain
        if(this.dataKey === undefined){
            json.data = data
            return json
        }

        //else encrypt with dataKey
        let iv = sjcl.random.randomWords(4)
        let cipher = new sjcl.cipher.aes(this.dataKey)
        let utf8Encode = new TextEncoder()
        let text = JSON.stringify(data)
        let array = sjcl.codec.bytes.toBits(Array.from(utf8Encode.encode(text)))

        json.data = Converter.bytesToHex(sjcl.codec.bytes.fromBits(sjcl.mode.ctr.encrypt(cipher, array, iv)))
        json.IV = Converter.bytesToHex(sjcl.codec.bytes.fromBits(iv))
        json.encryptedDataKey = Converter.bytesToHex(sjcl.codec.bytes.fromBits(this.encryptedDataKey))
        json.encryptedDataKeyIV = Converter.bytesToHex(sjcl.codec.bytes.fromBits(this.encryptedDataKeyIV))
        json.passwordSalt  = Converter.bytesToHex(sjcl.codec.bytes.fromBits(this.passwordSalt))

        return json
    }

     static async loadFromJSON(password){
        const res = await browser.storage.local.get("wallet")
        if (res.wallet === undefined) {
            baseWallet = BaseWallet.generateWallet()
            baseWallet.startLoop()
            baseWallet.save()
            return true
        } else {
            let wallet = BaseWallet.fromJSON(res.wallet, password)
            if(wallet){
                baseWallet = wallet
                baseWallet.startLoop()
                return true
            }
        }
        return false
    }

    save(){
        browser.storage.local.set({"wallet": this.toJSON()})
    }

    addAccount(){
        this.nonce++;
        const newProvider = new HDWalletProvider({
            mnemonic: this.mnemonic,
            providerOrUrl: this.wallets[this.selectedWallet].rpcURL,
            chainId: this.wallets[this.selectedWallet].chainID,
            numberOfAddresses: this.nonce,
            shareNonce: false
        })
        this.setProvider(newProvider)
        provider = newProvider
        this.save()
    }

    selectWallet(newWalletID){
        this.selectedWallet = newWalletID
        const newProvider = new HDWalletProvider({
            mnemonic: this.mnemonic,
            providerOrUrl: this.wallets[this.selectedWallet].rpcURL,
            chainId: this.wallets[this.selectedWallet].chainID,
            numberOfAddresses: this.nonce,
            shareNonce: false
        })
        this.setProvider(newProvider)
        provider = newProvider
        this.save()
        this.getCurrentWallet().update()
        this.getCurrentWallet().updatePrices()
    }

    selectAddress(addressID){
        this.selectedAddress = addressID
        this.save()
    }

    getCurrentWallet(){
        return this.wallets[this.selectedWallet]
    }

    getCurrentAddress(){
        return this.getAddresses()[this.selectedAddress]
    }

    getWalletsJSON(){
        const json = []
        for(const wallet of this.wallets)
            json.push(wallet.toJSON())

        return json
    }

    getAddresses(){
        return [...provider.addresses]
    }

}

BaseWallet.loadFromJSON()
