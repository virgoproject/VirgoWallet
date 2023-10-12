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
                    if(wallet.wallet.chainID == "400") continue
                    this.wallets.push(EthWallet.fromJSON(wallet.wallet))
                    break
            }
        }

        this.addresses = []

        this.checkMissingWallets()

        this.selectedWallet = data.selectedWallet
        this.selectedAddress = data.selectedAddress

        if(this.selectedWallet === undefined)
            this.selectedWallet = 0

        if(this.selectedAddress === undefined)
            this.selectedAddress = 0

        provider = new HDWalletProvider({
            mnemonic: this.mnemonic,
            providerOrUrl: this.wallets[this.selectedWallet].rpcURL,
            chainId: this.wallets[this.selectedWallet].chainID,
            numberOfAddresses: this.nonce,
            shareNonce: false
        })

        this.setProvider(provider)

        if(data.version !== undefined)
            this.version = data.version
        else{
            this.version = VERSION//To change for VERSION after next update
            this.save()
        }

        this.getSwapParams()
    }

    startLoop(){
        const timer = setInterval(function(){
            if(baseWallet === undefined){
                clearInterval(timer)
                return
            }
            baseWallet.getCurrentWallet().update()
        }, 2500)

        const startupWait = setInterval(() => {
            if(baseWallet.getCurrentWallet().getAddressesJSON().length == 0) return
            baseWallet.getCurrentWallet().update(true)
            clearInterval(startupWait)
        }, 50)

        const priceTimer = setInterval(function(){
            if(baseWallet === undefined){
                clearInterval(priceTimer)
                return
            }
            baseWallet.getCurrentWallet().updatePrices()
        }, 60000)
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
                "RPC": "https://rpc.ankr.com/eth",
                "chainID": 1,
                "tokens": [],
                "transactions": [],
                "nft":[],
                "explorer": "https://etherscan.io/tx/",
                "testnet": false,
                "atomicSwap": {
                    "lockerAddress": "0x07AF5E2075BB32FfdFF5Ac2Ffb492bdE5D98D65b",
                    "orders": []
                }
            }
        }

        wallets[1] = {
            "type": "web3",
            "wallet": {
                "name": "Goerli",
                "asset": "Ethereum",
                "ticker": "GETH",
                "decimals": 18,
                "contract": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "RPC": "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
                "chainID": 5,
                "tokens": [],
                "nft":[],
                "transactions": [],
                "explorer": "https://goerli.etherscan.io/tx/",
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
                "nft":[],
                "transactions": [],
                "explorer": "https://bscscan.com/tx/",
                "testnet": false,
                "atomicSwap": {
                    "lockerAddress": "0xFE8919beCDbC0A2d7BdEB03981f90B26C2DAc200",
                    "orders": []
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
                "RPC": "https://rpc.ankr.com/polygon",
                "chainID": 137,
                "tokens": [],
                "transactions": [],
                "explorer": "https://polygonscan.com/tx/",
                "testnet": false,
                "atomicSwap": {
                    "lockerAddress": "0xf91E9e5C955c0d19b435a8Bf526b8365a8E4eDf0"
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
                "explorer": "https://snowtrace.io/tx/",
                "testnet": false
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
                "explorer": "https://ftmscan.com/tx/",
                "testnet": false
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
                "RPC": "https://http-mainnet.hecochain.com/",
                "chainID": 128,
                "tokens": [],
                "transactions": [],
                "explorer": "https://hecoinfo.com/tx/",
                "testnet": false
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
                "explorer": "https://explorer.kcc.io/en/tx/",
                "testnet": false
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
                "explorer": "https://cronoscan.com/tx/",
                "testnet": false
            }
        }

        wallets[9] = {
            "type": "web3",
            "wallet": {
                "name": "Ether PoW",
                "asset": "EthereumPoW",
                "ticker": "ETHW",
                "decimals": 18,
                "contract": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "RPC": "https://mainnet.ethereumpow.org/",
                "chainID": 10001,
                "tokens": [],
                "transactions": [],
                "explorer": "https://www.oklink.com/en/ethw/tx/",
                "testnet": false
            }
        }

        wallets[10] = {
            "type": "web3",
            "wallet": {
                "name": "Ether Classic",
                "asset": "Ethereum Classic",
                "ticker": "ETC",
                "decimals": 18,
                "contract": "0x82A618305706B14e7bcf2592D4B9324A366b6dAd",
                "RPC": "https://www.ethercluster.com/etc",
                "chainID": 61,
                "tokens": [],
                "transactions": [],
                "explorer": "https://blockscout.com/etc/mainnet/tx/",
                "testnet": false
            }
        }

        wallets[11] = {
            "type": "web3",
            "wallet": {
                "name": "Ether Fair",
                "asset": "Ethereum Fair",
                "ticker": "ETHF",
                "decimals": 18,
                "contract": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "RPC": "https://rpc.etherfair.org/",
                "chainID": 513100,
                "tokens": [],
                "transactions": [],
                "explorer": "https://explorer.etherfair.org/tx/",
                "testnet": false
            }
        }

        return wallets
    }

    setProvider(provider){
        web3 = new Web3(provider)

        web3.eth.getAccounts().then(accounts => {
            this.addresses = accounts
        })

    }

    //check current wallets against reference list, if some networks are missing add them
    async checkMissingWallets(){

        let referenceWallets = BaseWallet.getBaseWallets()

        try {
            const refWalletsReq = await fetch("https://raw.githubusercontent.com/virgoproject/tokens/chainaddition1/chains.json")
            referenceWallets = await refWalletsReq.json()
        }catch(e){}

        let changed = false

        b: for(const refWallet of referenceWallets){
            for(const wallet of this.wallets)
                if(refWallet.wallet.chainID == wallet.chainID) continue b

            changed = true
            this.wallets.push(EthWallet.fromJSON(refWallet.wallet))
        }

        if(changed) this.save()
    }

    async getSwapParams(){
        try {

            const req = await fetch("https://swap.virgo.net/api/v1/chains_list")
            const dexs = await req.json()

            for(const wallet of this.wallets){
                if(dexs[wallet.chainID] === undefined)
                    wallet.swapV2Params = false
                else
                    wallet.swapV2Params = dexs[wallet.chainID]
            }

            this.save()

        }catch(e){
            console.log(e.message)
        }
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
            loadedElems["baseWallet"] = true
            return true
        } else {
            let wallet = BaseWallet.fromJSON(res.wallet, password)
            if(wallet){
                baseWallet = wallet
                baseWallet.startLoop()
                loadedElems["baseWallet"] = true
                return true
            }
        }
        loadedElems["baseWallet"] = true
        return false
    }

    save(){
        console.log("saving")
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
        provider.engine.stop()
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
        return this.addresses
    }

    getChainByID(id){
        for(let chain of this.wallets){
            if(chain.chainID == id)
                return chain
        }
        return false
    }

    getWeb3ByID(id){
        const chain = this.getChainByID(id)

        const newProvider = new HDWalletProvider({
            mnemonic: this.mnemonic,
            providerOrUrl: chain.rpcURL,
            chainId: chain.chainID,
            numberOfAddresses: this.nonce,
            shareNonce: false
        })

        const w3 = new Web3(newProvider)

        return w3
    }

}
