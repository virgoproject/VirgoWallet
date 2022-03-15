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

        this.selectedWallet = data.selectedWallet
        this.selectedAddress = data.selectedAddress

        provider = new HDWalletProvider({
            mnemonic: this.mnemonic,
            providerOrUrl: this.wallets[this.selectedWallet].rpcURL,
            chainId: this.wallets[this.selectedWallet].chainID,
            numberOfAddresses: this.nonce
        })

        web3 = new Web3(provider)

        //add wallet objects generated by HDWP to web3
        Object.entries(provider.wallets).map(([key, value]) => web3.eth.accounts.wallet.add(web3.utils.toHex(value.privateKey)))

    }

    startLoop(){
        baseWallet.getCurrentWallet().update()
        setInterval(function(){
            baseWallet.getCurrentWallet().update()
        }, 2500)

        setTimeout(function(){
            baseWallet.getCurrentWallet().updatePrices()
            setInterval(function(){
                baseWallet.getCurrentWallet().updatePrices()
            }, 30000)
        }, 2000)
    }

    static generateWallet(mnemonic){
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
                "tokens": []
            }
        }

        wallets[1] = {
            "type": "web3",
            "wallet": {
                "name": "Ropsten Testnet",
                "asset": "Ethereum",
                "ticker": "ETH",
                "decimals": 18,
                "contract": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "RPC": "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
                "chainID": 3,
                "tokens": []
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
                        "contract": "0xbee5e147e6e40433ff0310f5ae1a66278bc8d678"
                    }
                ]
            }
        }

        wallets[3] = {
            "type": "web3",
            "wallet": {
                "name": "Polygon",
                "asset": "Polygon",
                "ticker": "MATIC",
                "decimals": 18,
                "contract": "0x0000000000000000000000000000000000001010",
                "RPC": "https://polygon-rpc.com",
                "chainID": 137,
                "tokens": []
            }
        }

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
            numberOfAddresses: this.nonce
        })
        web3.setProvider(newProvider)
        provider = newProvider
        this.save()
    }

    selectWallet(newWalletID){
        this.selectedWallet = newWalletID
        const newProvider = new HDWalletProvider({
            mnemonic: this.mnemonic,
            providerOrUrl: this.wallets[this.selectedWallet].rpcURL,
            chainId: this.wallets[this.selectedWallet].chainID,
            numberOfAddresses: this.nonce
        })
        web3.setProvider(newProvider)
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