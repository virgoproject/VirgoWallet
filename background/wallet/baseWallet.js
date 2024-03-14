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
        this.privateKeys = data.privateKeys

        if(this.selectedWallet === undefined)
            this.selectedWallet = 0

        if(this.selectedAddress === undefined)
            this.selectedAddress = 0

        if(this.privateKeys === undefined){
            provider = new HDWalletProvider({
                mnemonic: this.mnemonic,
                providerOrUrl: this.wallets[this.selectedWallet].rpcURL,
                chainId: this.wallets[this.selectedWallet].chainID,
                numberOfAddresses: this.nonce,
                shareNonce: false,
                pollingInterval: 10000
            })

            this.privateKeys = []

            for(const wallet in provider.wallets){
                this.privateKeys.push("0x"+Converter.bytesToHex(provider.wallets[wallet].privateKey))
            }

            this.save()
        }else{
            provider = new HDWalletProvider({
                privateKeys: this.privateKeys,
                providerOrUrl: this.wallets[this.selectedWallet].rpcURL,
                chainId: this.wallets[this.selectedWallet].chainID,
                numberOfAddresses: this.nonce,
                shareNonce: false,
                pollingInterval: 10000
            })
        }

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
        }, 10000)

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
        data.privateKeys = this.privateKeys

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
            shareNonce: false,
            pollingInterval: 10000
        })

        this.privateKeys = []

        for(const wallet in newProvider.wallets){
            this.privateKeys.push("0x"+Converter.bytesToHex(newProvider.wallets[wallet].privateKey))
        }

        this.setProvider(newProvider)
        provider = newProvider
        this.save()
    }

    selectWallet(newWalletID){
        this.selectedWallet = newWalletID
        const newProvider = new HDWalletProvider({
            privateKeys: this.privateKeys,
            providerOrUrl: this.wallets[this.selectedWallet].rpcURL,
            chainId: this.wallets[this.selectedWallet].chainID,
            numberOfAddresses: this.nonce,
            shareNonce: false,
            pollingInterval: 10000
        })
        this.setProvider(newProvider)
        provider.engine.stop()
        provider = newProvider
        this.save()
        this.getCurrentWallet().update()
        this.getCurrentWallet().updatePrices()

        if(typeof walletConnect !== 'undefined'){
            walletConnect.updateSessions("chainChanged")
        }
    }

    selectAddress(addressID){
        this.selectedAddress = addressID
        this.save()

        if(typeof walletConnect !== 'undefined'){
            walletConnect.updateSessions("accountsChanged")
        }
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
            privateKeys: this.privateKeys,
            providerOrUrl: chain.rpcURL,
            chainId: chain.chainID,
            numberOfAddresses: this.nonce,
            shareNonce: false,
            pollingInterval: 10000
        })

        const w3 = new Web3(newProvider)

        return w3
    }

}
